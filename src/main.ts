#!/usr/bin/node
import path from 'path';
import readline from 'readline';
import Worker from 'web-worker';
import { WorkerData, WorkerResponse } from './types';

const DATA_BUFFER_SIZE = 512;

const sharedStdinBuffer = new SharedArrayBuffer(4 + 2 + DATA_BUFFER_SIZE * 2);

const dirname = path.relative(process.cwd(), __dirname);
const worker = new Worker(path.join(dirname, 'worker.js'));

worker.postMessage({
    sharedStdinBuffer,
    argv: process.argv.slice(2)
} as WorkerData);

worker.addEventListener('message', (ev: MessageEvent<WorkerResponse>) => {
    const { type, data } = ev.data;

    switch (type) {
        case 'stdout':
            process.stdout.write(data);
            break;
        case 'stderr':
            process.stderr.write(data);
            break;
    }
});

// First four bytes are our lock
const stdinDataAvailable = new Int32Array(sharedStdinBuffer, 0, 4);
// Next two are the payload size
const stdinDataSize = new Int16Array(sharedStdinBuffer, 4, 2);
// Rest is the payload
const stdinData = new Int16Array(sharedStdinBuffer, 6);

let stdinBuffer = '';

function canSendLine() {
    return Atomics.load(stdinDataAvailable, 0) === 0;
}

function sendLine() {
    const line = stdinBuffer.slice(0, DATA_BUFFER_SIZE);
    stdinBuffer = stdinBuffer.slice(DATA_BUFFER_SIZE);

    // Load data
    Atomics.store(stdinDataSize, 0, line.length);
    for (let i = 0; i < line.length; i++) {
        stdinData[i] = line.charCodeAt(i);
    }
    // Set data available and notify worker
    Atomics.store(stdinDataAvailable, 0, 1);
    Atomics.notify(stdinDataAvailable, 0);
}

let _currentlyPolling = false;

function markLineAvailable() {
    if (_currentlyPolling) {
        return;
    }
    const pollingInterval = setInterval(() => {
        if (canSendLine()) {
            sendLine();
            if (stdinBuffer.length === 0) {
                clearInterval(pollingInterval);
                _currentlyPolling = false;
            }
        }
    }, 50);
    _currentlyPolling = true;
}

const rl = readline.createInterface({
    input: process.stdin
});

rl.on('line', line => {
    line += '\n';
    
    stdinBuffer += line;

    if (canSendLine()) {
        sendLine();
    }

    if (stdinBuffer.length > 0) {
        markLineAvailable();
    }
});
