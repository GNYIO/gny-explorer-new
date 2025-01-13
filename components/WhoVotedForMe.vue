<template>

    <el-card>
        <h4 class="card-title">
            {{ formatTitle }}
        </h4>


        <!-- v-loading="loading" -->
        <el-table v-if="data" :data="data.voters" stripe>
            <el-table-column prop="senderId" align="center" label="Address">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
                        {{ scope.row.senderId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="lockAmount" align="center" label="Lock Amount" :formatter="formatLockAmount"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 800" prop="transactionId" align="center" label="Transaction ID"
                width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'transaction-detail', query: { id: scope.row.transactionId } }">
                        {{ scope.row.transactionId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 500" prop="height" align="center" label="Block Height" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ scope.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- <el-pagination class="center-horizontally" v-model:current-page="currentPage" :page-size="5"
            layout="prev, pager, next" :total="votersCount" /> -->
    </el-card>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js';
import type { IAccount, ITransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';

const connection = useFoo();




const props = defineProps({
    votedForAddress: {
        required: true,
        type: String,
    }
});

// https://stackoverflow.com/questions/59125857/how-to-watch-props-change-with-vue-composition-api-vue-3
const propsAddressRef = ref(props.votedForAddress);





// automatically re-runs when prop "votedForAddress" changes
const { data, error, status } = await useAsyncData(async () => {

    const newAddress = propsAddressRef.value;
    console.log(`(WhoVotedForMe) address of voter changed to "${newAddress}"`);

    if (newAddress === null || newAddress === undefined) {
        throw new Error('address should not be empty');
    }

    const delegateRaw = await connection.value.api.Delegate.getDelegateByAddress(newAddress);
    if (!delegateRaw.success) {
        throw new Error('could not fetch delegate');
    }


    const username = delegateRaw.delegate.username;
    const votersRaw = await connection.value.api.Delegate.getVoters(username);
    if (!votersRaw.success) {
        throw new Error('could not fetch voters');
    }
    const voterAccounts = votersRaw.accounts;



    // page voterAccounts. take only as much as fit on one page
    // const from = (currentPage - 1) * this.pageSize;
    // voterAccounts = voterAccounts.slice(from, from + this.pageSize);

    const result: ExplorerVoter[] = [];
    for (let account of voterAccounts) {
        // get the actual transaction when for "me" was voted for
        const voter = await getVotingTransaction(username, account);
        if (voter) {
            result.push(voter);
        }
    }

    result.sort((a: ExplorerVoter, b: ExplorerVoter) => Number(a.height) - Number(b.height)); // mutates own reference

    return {
        voters: result,
        votersCount: result.length,
    };
}, {
    watch: [propsAddressRef],
    lazy: true,
});


const formatTitle = computed(() => `Who Voted For Me (total: ${data.value?.votersCount})`);




function formatLockAmount(row: ExplorerVoter, column: TableColumnCtx<ExplorerVoter>) {
    return new BigNumber(row.lockAmount).dividedBy(1e8).toFixed();
}


interface ExplorerVoter {
    transactionId: string;
    height: string;
    senderId: string;
    lockAmount: string;
}



/**
 * get all basic.vote transactions for this account that voted for "me"
 * because one can vote,unvote and then again vote for an account
 * we need to search for the last transaction
 * @param ownUsername 
 * @param account 
 */
async function getVotingTransaction(ownUsername: string, account: IAccount) {

    let voter: ExplorerVoter = {};
    let query = {
        senderId: account.address,
        type: 4, // only voting transactions
        offset: 0,
        limit: 100,
    };

    // because someone could have more than 100 transactions
    // we should loop through all paged transactions
    let transactions: ITransaction[] = [];
    while (true) {
        const temp = await connection.value.api.Transaction.getTransactions(query);
        if (!temp.success) {
            throw new Error('could not fetch transactions');
        }

        transactions.push(...temp.transactions);

        // @ts-ignore
        if (temp.count > transactions.length) {
            query.offset += 100;
        } else {
            break;
        }
    }
    transactions.reverse(); // mutates reference


    console.log(`(WhoVotedForMe) fetched "${transactions.length}" vote transactions for voter "${account.address}"`);

    for (let i = 0; i < transactions.length; ++i) {
        const voteList = transactions[i].args as string[];
        if (voteList.includes(ownUsername)) {
            voter['transactionId'] = transactions[i].id;
            voter['height'] = transactions[i].height;
            voter['senderId'] = transactions[i].senderId;
            voter['lockAmount'] = account.lockAmount;

            return voter;
        }
    }

    throw new Error('should never happen')
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
