export interface WorkerData {
    sharedStdinBuffer: SharedArrayBuffer;
    argv: string[];
}

export interface WorkerResponse {
    type: 'stdout' | 'stderr';
    data: string;
}