<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Connected Nodes
            </h4>

            <el-table :data="data?.peersList" stripe v-loading="status !== 'success'">
                <el-table-column prop="peersInfo.publicIp" label="IP"></el-table-column>
                <el-table-column prop="system.p2p" label="p2p version"></el-table-column>
                <el-table-column prop="system.version" label="version"></el-table-column>
                <el-table-column prop="system.lastBlock.height" label="height"></el-table-column>
                <el-table-column prop="system.lastBlock.behind" label="behind"></el-table-column>
            </el-table>
        </el-card>

        <!-- <el-card class="shadow mt-4">
            <network :nodes="graphNodes" :edges="links" :options="options">
            </network>
        </el-card> -->

    </div>
</template>

<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import { getAllPeers } from '~/utils/getAllPeers';

const { ip, port, network, https } = useConfig().value;

const { data, error, status } = await useAsyncData(async () => {

    const result = await getAllPeers(ip, port, network, https);

    // this.graphNodes.push(...result.visNodes);

    // this.links.push(...result.visEdges);
    // allNodes.push(...result.peersList);

    result.peersList.sort((a, b) => {
        return new BigNumber(a.system.lastBlock.height).lt(b.system.lastBlock.height);
    });

    return {
        peersList: result.peersList,
    };
}, {
    lazy: true,
});


// count: 0,
// allNodes: [],

// systemVersion: '',
// height: '',

// versionCount: {},

// graphNodes: [],
// links: [],

// // settings for peer graph
// options: {
//     autoResize: true,
//     height: '500px',
//     width: '100%',

//     edges: {
//         arrows: {
//             to: {
//                 enabled: true,
//             }
//         },
//         physics: false,
//     },

//     nodes: {
//         shape: 'dot',
//         size: 10,

//         scaling: {
//             customScalingFunction: function (min, max, total, value) {
//                 return value / total;
//             },
//             min: 5,
//             max: 150
//         }
//     },
// },
// loading: true

</script>

<style>

.card-title {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
}

.el-card {
    margin-top: 20px;
}

.el-col {
    font-weight: 500;
}

p {
    color: #acacac;
}


.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}
</style>