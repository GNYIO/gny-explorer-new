<template>
    <el-card>
        <h4 v-if="data" class="card-title">
            {{ data.blockTitle }}
        </h4>

        <el-table :data="data?.blocks" stripe v-loading="status !== 'success'">
            <el-table-column prop="height" align="center" label="Height" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ scope.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="id" align="center" label="Block ID" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ subID(scope.row.id) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 300" prop="timestamp" align="center" label="Forged Time"
                :formatter="timestamp2date" width="190"></el-table-column>
            <el-table-column v-if="width >= 800" prop="count" align="center" label="Transactions"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 800" prop="fees" align="center" label="Fees" :formatter="formatFees"
                width="70"></el-table-column>
            <el-table-column v-if="width >= 800" prop="reward" align="center" label="Reward" :formatter="formatReward"
                width="80">
            </el-table-column>
        </el-table>
        <el-pagination v-if="data" class="center-horizontally" :disabled="status !== 'success'"
            v-model:current-page="currentPage" layout="prev, pager, next" :total="data.count" />
    </el-card>
</template>



<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import BigNumber from 'bignumber.js';
import type { TableColumnCtx } from 'element-plus';
import type { IBlock, DelegateViewModel } from '@gnyio/interfaces';


const props = defineProps({
    delegatePublicKey: {
        type: String,
        required: true,
    },
});

const propsRef = ref(props.delegatePublicKey);

const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    const pageSize = 10;

    const delegatePublicKey = propsRef.value;
    console.log(`received delegatePublicKey: ${delegatePublicKey} (currentPage: ${currentPage.value})`);
    if (!delegatePublicKey) {
        throw new Error('delegatePublicKey is wrong');
    }

    const offset = (currentPage.value - 1) * pageSize;
    const query = {
        limit: pageSize,
        offset: offset,
        publicKey: delegatePublicKey,
    };

    const blocksRaw = await connection.value.api.Delegate.ownProducedBlocks(query);
    if (!blocksRaw.success) {
        throw new Error('failed to fetch blocks of delegate');
    }

    const blockTitle = 'Produced Blocks ' + '(total: ' + blocksRaw.count + ')';

    return {
        blocks: blocksRaw.blocks,
        count: blocksRaw.count,
        blockTitle,
    };
}, {
    lazy: true,
    watch: [propsRef, currentPage],
});


function subID(id: string) {
    return id.slice(0, 8);
}

function timestamp2date(row: IBlock, column: TableColumnCtx<IBlock>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

function formatReward(row: IBlock, column: TableColumnCtx<IBlock>) {
    return new BigNumber(row.reward).dividedBy(1e8).toFixed();
}

function formatFees(row: DelegateViewModel, column: TableColumnCtx<DelegateViewModel>) {
    return new BigNumber(row.fees).dividedBy(1e8).toFixed();
}

const { width } = useWindowSize();
</script>

<style scoped>
.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}
</style>