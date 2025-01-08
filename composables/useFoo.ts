import * as gnyClient from '@gnyio/client';
import type { NetworkType } from '@gnyio/interfaces';


export const useFoo = () => {

    const config = useRuntimeConfig().public;
    console.log(`gny [plugin]: ${JSON.stringify(config, null, 2)}`);


    console.log(`endpoint: ${config.gnyEndpoint}`);
    const gny = new gnyClient.Connection(
        config.gnyEndpoint,
        Number(config.gnyPort),
        config.gnyNetwork as NetworkType,
        // @ts-ignore
        JSON.parse(config.gnyHttps || false),
    );

    console.log(`gny: ${gny}`);

    // Expose $gny from useNuxtApp()
    // return {
    //     provide: {
    //         gny: gny,
    //     },
    // };

    return useState('foo', () => gny);

}



// const { data, error } = await useAsyncData(() => $fetch('/api/blocks/getHeight', {
//     baseURL: baseUrl,
//     lazy: true,
// }));