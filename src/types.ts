export interface WorkerData {
    sharedStdinBuffer: SharedArrayBuffer;
    argv: string[];
}

interface WorkerResponses {
    stdout: number;
    stderr: number;
    exit: undefined;
}

export type WorkerResponse = {
    [Type in keyof WorkerResponses]:
        WorkerResponses[Type] extends undefined
            ? { type: Type, data?: WorkerResponses[Type] }
            : { type: Type, data: WorkerResponses[Type] }
}[keyof WorkerResponses];