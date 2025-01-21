<template>
    <el-card>
        <h4 class="card-title">
            Issuer Transaction
        </h4>

        <el-table :data="data?.issuerTransactions" stripe style="width: 100%; margin: auto;"
            v-loading="status !== 'success'">
            <el-table-column prop="id" align="center" label="TX ID" width="auto">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.id } }">
                        {{ table.row.id.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="height" align="center" label="Block Height" width="auto">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: table.row.height } }">
                        {{ table.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto"
                :formatter="timestamp2date"></el-table-column>
            <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto"
                :formatter="subSenderId">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: table.row.senderId } }">
                        {{ table.row.senderId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 800" prop="fee" label="Fee" :formatter="formatFee"
                width="auto"></el-table-column>
        </el-table>
    </el-card>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gnyio/utils';
import type { UnconfirmedTransaction, ITransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';


const props = defineProps({
    issuerId: {
        type: String,
        required: true,
    },
});
const issuerId = ref(props.issuerId);


const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    if (!issuerId.value) {
        throw new Error('prop issuerId not defined');
    }

    const issuerTransactionsRaw = await connection.value.api.Transaction.getTransactions({
        senderId: issuerId.value,
        type: 100,
    });
    if (!issuerTransactionsRaw.success) {
        throw new Error('[AssetIssuer] failed to fetch transaction');
    }

    return {
        issuerTransactions: issuerTransactionsRaw.transactions,
        count: issuerTransactionsRaw.count,
    };
}, {
    lazy: true,
    watch: [issuerId],
});

function subSenderId(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return row.senderId.slice(0, 8);
}

function timestamp2date(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

function formatFee(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return new BigNumber(row.fee).dividedBy(1e8).toFixed();
}

const { width } = useWindowSize();

</script>


<style>

.card-title {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
  }

</style>
