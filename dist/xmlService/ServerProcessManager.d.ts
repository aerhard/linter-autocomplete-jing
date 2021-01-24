export interface ServerConfig {
    jvmArguments: string;
    javaExecutablePath: string;
    schemaCacheSize: number;
}
export default class ServerProcessManager {
    private state;
    private portPromise;
    private javaProcess;
    isStopped(): boolean;
    getPortIfReadyNow(): Promise<number | null>;
    getPortIfStartupTriggered(): Promise<number | null>;
    ensurePort(config: ServerConfig): Promise<number>;
    shutdown(): void;
    private startup;
    private waitForPort;
    private setDefaultListeners;
    private removeListeners;
}
