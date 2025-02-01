<template>
    <el-card>
        <h4 class="card-title">
            My Transactions (total: {{ data?.transactionsCount || 0 }})
        </h4>

        <!-- @row-click="transactionRowClick" -->
        <el-table :data="data?.transactions" @row-click="transactionRowClick" stripe v-loading="status !== 'success'">
            <el-table-column prop="height" align="center" label="Height" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ scope.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="id" align="center" label="Transaction ID" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.id } }">
                        {{ scope.row.id.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 1000" prop="timestamp" align="center" label="Forged Time"
                :formatter="timestamp2date" width="155"></el-table-column>
            <el-table-column v-if="width >= 800" prop="senderId" align="center" label="Sender" width="150">
                <template #default="scope">
                    <!-- should be always ME -->
                    <span v-if="senderAddress === scope.row.senderId">ME</span>
                    <span v-else>{{ scope.row.senderId.slice(0, 8) }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 800" prop="fee" align="center" label="Fee" :formatter="formatFee"
                width="100"></el-table-column>
            <el-table-column v-if="width >= 1000" prop="type" align="center" label="Type" :formatter="formatType"
                width="auto"></el-table-column>
        </el-table>

        <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
            :page-size="5" layout="prev, pager, next" :total="data?.transactionsCount" />

    </el-card>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import BigNumber from 'bignumber.js';
import type { UnconfirmedTransaction, ITransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';

const { $contractMappingFilter } = useNuxtApp()

const connection = useFoo();


const props = defineProps({
    senderAddress: {
        required: true,
        type: String,
    },
});

const senderAddress = ref(props.senderAddress);
const currentPage = ref(1);

const { data, status, error } = useAsyncData(async () => {

    const val = senderAddress.value;
    if (!val) {
        throw new Error('senderAddress prop is not defined');
    }

    const pageSize = 5;

    const from = (currentPage.value - 1) * pageSize;
    const query = {
        limit: pageSize,
        offset: from,
        senderId: val,
    };

    const raw = await connection.value.api.Transaction.getTransactions(query);
    if (!raw.success) {
        throw new Error('');
    }

    return {
        transactions: raw.transactions,
        transactionsCount: raw.count,
    };
}, {
    lazy: true,
    watch: [senderAddress, currentPage],
});



function formatFee(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return new BigNumber(row.fee).dividedBy(1e8).toFixed();
}

function formatType(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return $contractMappingFilter(row.type);
}

function timestamp2date(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

async function transactionRowClick(row: (UnconfirmedTransaction | ITransaction), column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    await navigateTo({
        name: 'transaction-detail',
        query: {
            id: row.id,
        }
    });
}

const { width } = useWindowSize();

</script>

<style scoped>
.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}

.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}
</style>