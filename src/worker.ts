// @ts-ignore
import loadScheme from './chez/scheme.js';
import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import { WorkerData, WorkerResponse } from './types.js';

declare function postMessage(data: WorkerResponse): void;

console.log = (str: string) => postMessage({ type: 'stdout', data: str + '\n' });
console.error = (str: string) => postMessage({ type: 'stderr', data: str + '\n' });

addEventListener('message', async (ev: MessageEvent<WorkerData>) => {
    const {
        sharedStdinBuffer,
        argv
    } = ev.data;

    // First four bytes are our lock
    const stdinDataAvailable = new Int32Array(sharedStdinBuffer, 0, 4);
    // Next two are the payload size
    const stdinDataSize = new Int16Array(sharedStdinBuffer, 4, 2);
    // Rest is the payload
    const stdinData = new Int16Array(sharedStdinBuffer, 6);

    const stdinBuffer = [] as number[];
    
    function flushStdin() {
        stdinBuffer.push(...stdinData.slice(0, stdinDataSize[0]));
    }

    let followingNewline = false;

    function readCharFromStdinBuffer() {
        const char = stdinBuffer.shift();
        if (char === 10) {
            // Char code 10 is a newline
            followingNewline = true;
        }
        return char;
    }

    const Module = {
        arguments: argv,
        stdin() {
            if (followingNewline) {
                // We need to send a null byte in order
                // to terminate the input.
                followingNewline = false;
                return null;
            }

            if (stdinBuffer.length > 0) {
                return readCharFromStdinBuffer();
            }

            // Sleep while no data is available
            Atomics.wait(stdinDataAvailable, 0, 0);
            flushStdin();
            // Once data is consumed, unset the data available flag
            Atomics.store(stdinDataAvailable, 0, 0);

            return readCharFromStdinBuffer() ?? null;
        },
        stdout(char: number) {
            postMessage({ type: 'stdout', data: String.fromCharCode(char) });
        },
        stderr(char: number) {
            postMessage({ type: 'stderr', data: String.fromCharCode(char) });
        },
        onExit() {
            postMessage({ type: 'exit' });
        }
    } as any;
    
    loadScheme(Module);

    const FS = Module.$internal('FS');
            
    function createDir(dirname: string) {
        const pathParts = dirname.split('/');
        if (pathParts[0] === '') {
            pathParts.shift();
            pathParts[0] = `/${pathParts[0] ?? ''}`;
        }

        let path = '';
        for (const part of pathParts) {
            path += '/' + part;
            try {
                FS.stat(path);
            }
            catch (e) {
                FS.mkdir(path);
            }
        }
    }

    function loadFile(fsPath: string, data: Buffer) {
        createDir(path.dirname(fsPath));
        
        const mode = FS.getMode(true, true);
        const node = FS.create(fsPath, mode);
        FS.chmod(node, mode | 146);
        const stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, true);
        FS.close(stream);
        FS.chmod(node, mode);
    }

    async function preloadFile(fsPath: string, data: Buffer | Promise<Buffer>) {
        const addRunDependency = Module.$internal('addRunDependency');
        const removeRunDependency = Module.$internal('removeRunDependency');

        const depName = `preloadFile ${fsPath}`;
        addRunDependency(depName);
        loadFile(fsPath, await data);
        removeRunDependency(depName);
    }

    const lookupPath = FS.lookupPath;
    FS.lookupPath = (fsPath: string, opts: any) => {
        try {
            return lookupPath(fsPath, opts);
        }
        catch (e) {
            let realPath = fsPath;
            loadFile(fsPath, readFileSync(path.join(realPath, process.cwd())));
            return lookupPath(fsPath, opts);
        }
    };

    Module.preRun = () => {
        preloadFile('/petite.boot', readFile(path.join(__dirname, './chez/petite.boot')));
        preloadFile('/scheme.boot', readFile(path.join(__dirname, './chez/scheme.boot')));
    };
});
