<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Block
            </h4>

            <div class="wrapper">
                <div>
                    Block ID
                    <p>
                        {{ data?.block.id.slice(0, 8) }}

                        <!-- svg of element-plus "CopyDocumnet" icon-->
                        <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
                        <svg class="copy-document" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"
                            @click="copyId">
                            <path fill="currentColor"
                                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
                            </path>
                            <path fill="currentColor"
                                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
                            </path>
                        </svg>
                    </p>

                </div>
                <div :span="8">
                    Height
                    <p>{{ data?.block.height }}</p>
                </div>
                <div :span="8" v-if="data?.block.prevBlockId">
                    Previous block
                    <p>
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'block-detail', query: { height: Number(data.block.height) - 1 } }">
                            {{ data.block.prevBlockId.slice(0, 8) }}
                        </nuxt-link>
                    </p>
                </div>
                <div :span="8" v-if="!data?.block.prevBlockId">
                    Previous block
                    <p>-</p>
                </div>
                <div :span="8">
                    Date
                    <p>{{ moment.utc(slots.getRealTime(data?.block.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC') }}</p>
                </div>
                <div :span="8">
                    Transaction count
                    <p>{{ data?.block.count }}</p>
                </div>
                <div :span="8">
                    Reward
                    <p>{{ formatReward(data?.block.reward) }} GNY</p>
                </div>
                <div :span="8">
                    Delegate
                    <p v-if="data?.block.height !== '0'">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'delegate-detail', query: { publicKey: data?.block.delegate } }">
                            {{ data?.delegate.username }}
                        </nuxt-link>
                    </p>
                    <!-- delegate for block height 0 doesn't exist -->
                    <p v-else>-</p>
                </div>
            </div>
        </el-card>

        <el-card class="card-space">
            <h4 class="card-title">
                Transactions included in this Block
            </h4>

            <el-table :data="data?.transactions" stripe style="width: 95%; margin: auto;"
                v-loading="status !== 'success'">
                <el-table-column prop="id" align="center" label="Transaction ID" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.id } }">
                            {{ scope.row.id.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column prop="timestamp" align="center" label="Forged Time" width="200"
                    :formatter="timestamp2date"></el-table-column>
                <el-table-column prop="senderId" align="center" label="Sender" width="295" :formatter="subSenderId">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
                            {{ scope.row.senderId }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column prop="fee" align="center" label="Fee" width="120"></el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
// import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gnyio/utils';
import type { ITransaction, DelegateViewModel } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';
import BigNumber from 'bignumber.js';


const connection = useFoo();
const route = useRoute();
const routeQuery = computed(() => route.query)

const { data, error, status } = await useAsyncData(async () => {

    const val = routeQuery.value;
    console.log(`[block-detail] query changed: ${JSON.stringify(val, null, 2)}`);
    if (typeof val.height !== 'string') {
        throw new Error('height query parameter not defined');
    }


    const blockRaw = await connection.value.api.Block.getBlockByHeight(val.height);
    if (!blockRaw.success) {
        throw new Error('failed to fetch block by height');
    }
    const block = blockRaw.block;

    const transactionsRaw = await connection.value.api.Transaction.getTransactions({
        height: val.height,
    });
    if (!transactionsRaw.success) {
        throw new Error('failed to fetch transactions ');
    }

    const transactions = transactionsRaw.transactions;

    // delegate should always have an username
    // height "0" has no delegate
    let delegate: DelegateViewModel | undefined = undefined;
    if (block.height !== '0') {
        const delegateRaw = await connection.value.api.Delegate.getDelegateByPubKey(block.delegate);
        if (!delegateRaw.success) {
            throw new Error('failed to fetch delegate who forged block');
        }
        delegate = delegateRaw.delegate;
    }

    return {
        block,
        transactions,
        delegate,
    };
}, {
    lazy: true,
    watch: [routeQuery],
});


const {
    isSupported,
    copy,
} = useClipboard();

// https://vueuse.org/core/useClipboard/
async function copyId() {
    if (!isSupported) {
        console.log('copying to clipboard is ont supported');
        return;
    }
    const result = data.value?.block.id || '';
    await copy(result);
}

/**
 * this function could be called with undefined
 * @param input 
 */
function formatReward(input: string | undefined) {
    if (!input) {
        return '';
    } else {
        return new BigNumber(input).dividedBy(1e8).toFixed();
    }
}

function subSenderId(row: ITransaction, column: TableColumnCtx<ITransaction>) {
    return row.senderId.slice(0, 8);
}

function timestamp2date(row: ITransaction, column: TableColumnCtx<ITransaction>) {
    return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}
</script>


<style scoped>
i {
    cursor: pointer;
}

.wrapper {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
}

/* changed */
@media screen and (min-width: 700px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

/* changed */
@media screen and (min-width: 1000px) {
    .wrapper {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

p {
    color: #acacac;
}

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}

.copy-document {
    width: 20px;
}

.copy-document:hover {
    cursor: pointer;
}

.copy-document:hover path {
    fill: #565656;
}

.copy-document:active path {
    fill: #000;
}

.card-space {
    margin-top: 1.5rem;
}
</style>
