<template>
    <el-card>
        <h4 class="card-title">
            Blocks
        </h4>

        <el-table v-el-table-infinite-scroll="infiniteHandler" :data="blocks" stripe height="500" v-loading="loading">
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
            <el-table-column v-if="width > 1050" prop="timestamp" align="center" label="Forged Time" width="165"
                :formatter="timestamp2date"></el-table-column>
            <el-table-column v-if="width > 700" prop="count" align="center" label="TXs" width="80"></el-table-column>
            <el-table-column v-if="width > 800" prop="fees" align="center" label="Fees" width="80"
                :formatter="formatFees"></el-table-column>
            <el-table-column v-if="width > 800" prop="reward" align="center" label="Reward" width="80"
                :formatter="formatReward">
            </el-table-column>
            <el-table-column v-if="width > 400" prop="delegate" align="center" label="Delegate" width="auto">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'delegate-detail', query: { publicKey: table.row.delegate } }">
                        {{ subDelegate(table.row.delegate) }}
                    </nuxt-link>
                </template>
            </el-table-column>

        </el-table>
    </el-card>
</template>


<script setup lang="ts">
import { default as vElTableInfiniteScroll } from "el-table-infinite-scroll";

import moment from 'moment';
import { slots } from '@gnyio/utils';
import { BigNumber } from 'bignumber.js';
import type { IBlock } from '@gnyio/interfaces';
import type { TableColumnCtx } from "element-plus";



function subID(id: string) {
    return id.slice(0, 8);
}

function subDelegate(delegate: string) {
    return delegate.slice(0, 8);
}

function timestamp2date(row: IBlock, column: TableColumnCtx<IBlock>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

function formatReward(row: IBlock, column: TableColumnCtx<IBlock>) {
    return new BigNumber(row.reward).dividedBy(1e8).toFixed();
}

function formatFees(row: IBlock, column: TableColumnCtx<IBlock>) {
    return new BigNumber(row.fees).dividedBy(1e8).toFixed();
}



const connection = useFoo();

const blocks = ref<Array<IBlock>>([]);
const loaded = ref(0);
const loading = ref(true);

async function infiniteHandler() {
    console.log('infiniteHandler');

    const orderBy = 'height:desc';
    const offset = String(loaded.value);
    const limit = String(50);

    const blocksRaw = await connection.value.api.Block.getBlocks(offset, limit, orderBy);
    if (!blocksRaw.success) {
        throw new Error('failed to load blocks');
    }

    blocks.value.push(...blocksRaw.blocks);

    if (blocks.value.length >= 0) {
        loading.value = false;
    }

    loaded.value += blocksRaw.blocks.length;
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

.el-card {
    margin-top: 20px;
}

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}
</style>
