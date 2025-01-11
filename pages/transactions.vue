<template>
    <el-card>
        <h4 class="card-title">
            Transactions
        </h4>

        <el-table v-el-table-infinite-scroll="infiniteHandler" @row-click="rowClick" :data="transactions" stripe height="500" v-loading="loading">
            <el-table-column prop="id" align="center" width="auto" label="Transaction ID">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.id } }">
                        {{ scope.row.id.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="height" align="center" label="Block Height" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ scope.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width > 1050" prop="timestamp" align="center" label="Forged Time" width="165"
                :formatter="timestamp2date"></el-table-column>
            <el-table-column v-if="width > 450" prop="senderId" align="center" label="Sender" width="auto"
                :formatter="subSenderId">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
                        {{ scope.row.senderId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width > 800" prop="fee" label="Fee" align="center" width="auto"
                :formatter="formatFee"></el-table-column>
            <el-table-column v-if="width > 600" prop="type" label="Type" align="center" width="auto"
                :formatter="formatType"></el-table-column>
        </el-table>

    </el-card>
</template>



<script setup lang="ts">
import { default as vElTableInfiniteScroll } from "el-table-infinite-scroll";

import BigNumber from 'bignumber.js';
import moment from 'moment';

import { slots } from '@gnyio/utils';
import type { UnconfirmedTransaction, ITransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';



async function rowClick(row: any, column: any, event: Event) {
    await navigateTo({
        path: '/transaction-detail',
        query: {
            id: row.id,
        }
    });
}


function subSenderId(row: UnconfirmedTransaction | ITransaction, column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return row.senderId.slice(0, 8);
}

function timestamp2date(row: UnconfirmedTransaction | ITransaction, column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

function formatFee(row: UnconfirmedTransaction | ITransaction, column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return new BigNumber(row.fee).dividedBy(1e8).toFixed();
}

function formatType(row: UnconfirmedTransaction | ITransaction, column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    const { $contractMappingFilter } = useNuxtApp()
    const result = $contractMappingFilter(row.type);
    return result;
}



const transactions = ref<Array<UnconfirmedTransaction | ITransaction>>([]);
const count = ref(0);
const loaded = ref(0);
const loading = ref(true);



const connection = useFoo();

async function infiniteHandler() {

    const countRaw = await connection.value.api.Transaction.getCount();
    if (!countRaw.success) {
        throw new Error('failed ot fetch transaction count');
    }

    const count = countRaw.count;


    const limit = 50;
    const offset = count - loaded.value - limit;
    console.log(`offset: ${offset}`);

    const newTransactionsRaw = await connection.value.api.Transaction.getTransactions({
        limit,
        offset,
    });
    if (!newTransactionsRaw.success) {
        throw new Error('failed to fetch transactions');
    }
    const x = newTransactionsRaw.transactions.reverse();

    transactions.value.push(...x);
    loaded.value += limit;

    if (transactions.value.length >= 0) {
        loading.value = false;
    }
}


const { width } = useWindowSize()

</script>


<style scoped>
.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 0;
}

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}
</style>
