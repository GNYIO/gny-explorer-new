<template>
    <el-card>
        <h4 class="card-title">
            Transfers
        </h4>

        <el-table :data="data?.transactions" stripe style="width: 100%; margin: auto;" v-loading="status !== 'success'">
            <el-table-column prop="id" align="center" width="auto" label="TX ID">
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
            <el-table-column v-if="width >= 400" prop="fee" label="Fee" :formatter="formatFee"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 400" prop="type" label="Type" :formatter="formatType"
                width="auto"></el-table-column>
        </el-table>

        <el-pagination :disabled="loading" class="center-horizontally" v-model:current-page="currentPage" :page-size="5"
            layout="prev, pager, next" :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">
const connection = useFoo();
import type { ITransaction, UnconfirmedTransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gnyio/utils';


const props = defineProps({
    assetName: {
        type: String,
        required: true,
    },
});

const assetName = ref(props.assetName);
const loading = ref(true);
const currentPage = ref(1);

const { data, error, status } = await useAsyncData(async () => {

    if (!assetName.value) {
        throw new Error('[AssetTransfer] assetName is not defined');
    }

    loading.value = true;

    const limit = 5;
    const offset = (currentPage.value - 1) * limit;

    const transfersRaw = await connection.value.api.Transfer.getRoot({
        currency: assetName.value,
        limit,
        offset
    });
    if (!transfersRaw.success) {
        throw new Error('failed to fetch asset transfers');
    }

    const transactions: ITransaction[] = transfersRaw.transfers.map(x => x.transaction as unknown as ITransaction);

    loading.value = false;

    return {
        transactions,
        count: transfersRaw.count,
    };
}, {
    lazy: true,
    watch: [currentPage],
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

function formatType(row: UnconfirmedTransaction | ITransaction, column: TableColumnCtx<UnconfirmedTransaction | ITransaction>) {
    const { $contractMappingFilter } = useNuxtApp()
    const result = $contractMappingFilter(row.type);
    return result;
}


const { width } = useWindowSize();

</script>


<style scoped>

.card-title {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
  }

.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}
</style>