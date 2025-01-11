<template>
    <el-card>
        <h4 class="card-title">
            Burnings
        </h4>

        <el-table v-el-table-infinite-scroll="myHandler" :data="burn" stripe height="500" v-loading="loading">
            <el-table-column prop="amount" align="center" label="Amount" :formatter="formatAmount"></el-table-column>
            <el-table-column v-if="width > 300" width="100" prop="height" align="center"
                label="Height"></el-table-column>
            <el-table-column v-if="width > 450" prop="senderId" align="center" label="Sender" width="auto"
                :formatter="subSenderId">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
                        {{ scope.row.senderId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="tid" align="center" width="120" label="Transaction ID">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                        {{ scope.row.tid.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>


<script setup lang="ts">
import { default as vElTableInfiniteScroll } from "el-table-infinite-scroll";

import { BigNumber } from 'bignumber.js';
import type { IBurn } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';
import { ref } from 'vue'

const connection = useFoo();

const burn = ref<IBurn[]>([]);
const limit = ref(15);
const offset = ref(0);
const loaded = ref(0);
const loading = ref(true);

// const { data, error, status } = await useAsyncData(async () => {
//     const burnRaw = await connection.value.api.Burn.getAll(limit.value, offset.value)
//     if (!burnRaw.success) {
//         throw new Error('failed to fetch burnings');
//     }

//     burn.value.push(...burnRaw.burn);

//     loading.value = false;
// });


async function myHandler() {
    console.log('infiniteHandler');


    try {
        console.log(`limit: ${limit.value}, offset: ${offset.value}`);

        const burnRaw = await connection.value.api.Burn.getAll(limit.value, offset.value)
        if (!burnRaw.success) {
            throw new Error('failed to fetch burnings');
        }

        burn.value.push(...burnRaw.burn);

        if (burn.value.length >= 0) {
            loading.value = false;
        }

        loaded.value += burnRaw.burn.length;
        offset.value = loaded.value;



    } catch (err: unknown) {
        console.log(err);
    }
}

function formatAmount(row: IBurn, column: TableColumnCtx<IBurn>) {
    return new BigNumber(row.amount).dividedBy(1e8).toFixed() + ' GNY';
}

function subSenderId(row: IBurn, column: TableColumnCtx<IBurn>) {
    return row.senderId.slice(0, 8);
}


const width = 600;
</script>



<style scoped>
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

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}
</style>