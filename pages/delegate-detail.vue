<template>
    <div>
        <el-card title="Delegate">
            <h4 class="card-title">
                Delegate
            </h4>

            <div class="wrapper">
                <div>
                    Username
                    <p>
                        <nuxt-link v-if="data" class="nuxt-link"
                            :to="{ name: 'account-detail', query: { username: data.delegate.username } }">{{
                                data.delegate.username }}</nuxt-link>
                    </p>
                </div>
                <div>
                    Public Key
                    <p v-if="data">{{ data.delegate.publicKey.slice(0, 8) }}</p>
                </div>
                <div>
                    Address
                    <p>
                        <nuxt-link v-if="data" class="nuxt-link"
                            :to="{ name: 'account-detail', query: { address: data.delegate.address } }">{{
                                data.delegate.address
                            }}</nuxt-link>
                    </p>
                </div>
                <div>
                    Produced Blocks
                    <p v-if="data">{{ data.delegate.producedBlocks }}</p>
                </div>
                <div>
                    Unlocked Balance
                    <br>
                    <!-- <i v-if="prettyBalance === ''" class="el-icon-loading"></i> -->
                    <p v-if="data">{{ data.prettyBalance }} GNY</p>
                </div>
                <div>
                    Locked Balance (voting weight)
                    <br v-if="!data?.prettyLockBalance">
                    <!-- <i v-if="prettyLockBalance === ''" class="el-icon-loading"></i> -->
                    <p v-if="data">{{ data.prettyLockBalance }} GNY</p>
                </div>
                <div>
                    Is Locked
                    <p v-if="data">{{ data.isLocked }}</p>
                </div>
                <div>
                    Lock Height
                    <br v-if="!data?.account.lockHeight">
                    <!-- <i v-if="lockHeight === ''" class="el-icon-loading"></i> -->
                    <p v-if="data">{{ data.account.lockHeight }}</p>
                </div>
                <div>
                    Missed Blocks
                    <p v-if="data">{{ data.delegate.missedBlocks }}</p>
                </div>
                <div>
                    Rewards
                    <p v-if="data">{{ data.rewards }} GNY</p>
                </div>
                <div>
                    Rank
                    <p v-if="data"># {{ data.delegate.rate }}</p>
                </div>
                <div>
                    Approval
                    <p v-if="data">{{ data.delegate.approval }} %</p>
                </div>
                <div>
                    Productivity
                    <p v-if="data">{{ data.delegate.productivity }} %</p>
                </div>
                <div>
                    Registration Transaction
                    <p>
                        <nuxt-link v-if="data" class="nuxt-link"
                            :to="{ name: 'transaction-detail', query: { id: data.delegate.tid } }">
                            {{ data.delegate.tid.slice(0, 8) }}
                        </nuxt-link>
                    </p>
                </div>
            </div>
        </el-card>

        <el-card>
            <h4 v-if="data" class="card-title">
                {{ data.blockTitle }}
            </h4>

            <!-- v-loading="loading" -->
            <el-table v-if="blockData" :data="blockData.blocks" stripe v-loading="blocksAreLoading">
                <el-table-column prop="height" align="center" label="Height" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                            {{ scope.row.height }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column prop="id" align="center" label="Block ID" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'block-detail', query: { height: scope.row.height } }">
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
                <el-table-column v-if="width >= 800" prop="reward" align="center" label="Reward"
                    :formatter="formatReward" width="80">
                </el-table-column>
            </el-table>
            <el-pagination class="center-horizontally" :disabled="blocksAreLoading" v-model:current-page="currentPage" layout="prev, pager, next"
                :total="blockData?.count" />
        </el-card>

        <WhoVotedForMe v-if="data" :votedForAddress="data.delegate.address" />

        <!-- <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component> -->

    </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import BigNumber from 'bignumber.js';
import type { DelegateViewModel, IAccount, IBlock } from '@gnyio/interfaces';
import type { LocationQueryValue } from 'vue-router';
import type { TableColumnCtx } from 'element-plus';


// import WhoVotedForMeComponent from '../components/WhoVotedForMe.vue';
// import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';



const route = useRoute();

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

function formatFees(row: DelegateViewModel, column: TableColumnCtx<DelegateViewModel>) {
    return new BigNumber(row.fees).dividedBy(1e8).toFixed();
}






const connection = useFoo();


// type guard to narrow types
function isString(arg: any): arg is LocationQueryValue {

    if (typeof arg === 'string') {
        return true;
    }
    return false;
}



const routeQuery = computed(() => route.query)

// automatically re-runs when the query part of the URL changes
const { data, error, status } = await useAsyncData(async () => {

    const query = routeQuery.value;
    console.log(`reactive query: ${JSON.stringify(query, null, 2)}`);

    const potentialUsername = routeQuery.value['username'];
    const potentialPublicKey = routeQuery.value['publicKey'];

    // https://dushkin.tech/posts/js_assign_variable_in_switch/
    const delegate: DelegateViewModel = await (async function () {
        if (isString(potentialUsername)) {

            const result = await connection.value.api.Delegate.getDelegateByUsername(String(potentialUsername));
            if (result.success) {
                return result.delegate;
            }
        }

        if (isString(potentialPublicKey)) {
            const result = await connection.value.api.Delegate.getDelegateByPubKey(String(potentialPublicKey));
            if (result.success) {
                return result.delegate;
            }
        }

        throw new Error('failed to fetch either ')
    })();


    delegate.approval = new BigNumber(delegate.approval).decimalPlaces(4).toFixed();
    delegate.productivity = new BigNumber(delegate.productivity).times(100).decimalPlaces(4).toFixed();

    // this.address = delegate.address;
    // this.publicKey = delegate.publicKey;
    // this.trs = delegate.tid.slice(0, 8);
    const rewards = new BigNumber(delegate.rewards).dividedBy(1e8).toFixed();
    const blockTitle = 'Produced Blocks ' + '(total: ' + delegate.producedBlocks + ')';
    const blocksCount = new BigNumber(delegate.producedBlocks).toNumber();

    const accountRaw = await connection.value.api.Account.getAccountByAddress(delegate.address);
    if (!accountRaw.success) {
        throw new Error('failed when fetching account of delegate');
    }
    const account: IAccount = accountRaw as IAccount; // why?

    const prettyBalance = new BigNumber(account.gny).dividedBy(1e8).toFixed(0);
    const prettyLockBalance = new BigNumber(account.lockAmount).dividedBy(1e8).toFixed(0);
    const isLocked = account.isLocked === 1 ? true : false;

    return {
        delegate,

        rewards,
        blockTitle,
        blocksCount,

        account,
        prettyBalance, // account
        prettyLockBalance, // account
        isLocked, // account
    };
}, {
    watch: [routeQuery],
    lazy: true,
});




// pagination
const currentPage = ref(1);
const delegatePublicKey = computed(() => data.value?.delegate.publicKey);
const blocksAreLoading = ref(true);

const { data: blockData, error: blockError, status: blockStatus } = await useAsyncData(async () => {

    blocksAreLoading.value = true;

    console.log(`delegatePublicKey: ${JSON.stringify(delegatePublicKey.value, null, 2)}`)

    // what to do if there is no publicKey ?
    if (!delegatePublicKey.value) {
        throw new Error('delegatePublicKey is not defined');
    }

    const pageSize = 10;

    const offset = (currentPage.value - 1) * pageSize;
    const query = {
        limit: pageSize,
        offset: offset,
        publicKey: delegatePublicKey.value,
    };

    const blocksRaw = await connection.value.api.Delegate.ownProducedBlocks(query);
    if (!blocksRaw.success) {
        throw new Error('failed to fetch blocks of delegate');
    }

    blocksAreLoading.value = false;

    return {
        blocks: blocksRaw.blocks,
        // @ts-ignore
        count: blocksRaw.count
    };
}, {
    // todo refactor use of "delegatePublicKey" (export to own component)
    watch: [currentPage, delegatePublicKey],
    lazy: true,
});


onMounted(async () => {
    console.log('onMounted');
    let username = null;
    let publicKey = null;

    if (route.query.hasOwnProperty('username')) {
        username = route.query.username;
    }

    if (route.query.hasOwnProperty('publicKey')) {
        publicKey = route.query.publicKey;
    }


    // await updatePage(username, publicKey);
    // await handleCurrentChange(1);
});

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

.wrapper {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
}

/* changed from 300px to 650 */
@media screen and (min-width: 650px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

/* removed one media query */

@media screen and (min-width: 800px) {
    .wrapper {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}

.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}

p {
    color: #acacac;
}
</style>
