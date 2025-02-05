import type { NetworkType } from '@gnyio/interfaces';

export const useConfig = () => {
    const config = useRuntimeConfig().public;

    const ip = config.gnyEndpoint;
    const port = Number(config.gnyPort);
    const network: NetworkType = config.gnyNetwork as NetworkType;
    // @ts-ignore
    const https: boolean = JSON.parse(config.gnyHttps || false) as boolean;

    const result = {
        ip,
        port,
        network,
        https
    };

    return useState('config', () => result);
}
