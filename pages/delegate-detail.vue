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

        <DelegateProducedBlocks v-if="data?.delegate" :delegatePublicKey="data.delegate.publicKey" />

        <WhoVotedForMe v-if="data" :votedForAddress="data.delegate.address" />

        <WhoIVotedFor v-if="data" :addressOfVoter="data.delegate.address" />

    </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import BigNumber from 'bignumber.js';
import type { DelegateViewModel, IAccount, IBlock } from '@gnyio/interfaces';
import type { LocationQueryValue } from 'vue-router';
import type { TableColumnCtx } from 'element-plus';
import DelegateProducedBlocks from '~/components/DelegateProducedBlocks.vue';


const route = useRoute();



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
