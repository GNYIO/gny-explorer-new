<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Delegates
            </h4>

            <div class="wrapper">
                <div>
                    All Delegates
                    <p v-if="data">{{ data.count }}</p>
                    <br v-if="status !== 'success'">
                    <i v-if="status !== 'success'" class="el-icon-loading"></i>
                </div>
                <div>
                    Most Produced Blocks
                    <p v-if="data">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'delegate-detail', query: { username: data.mostProducedBlocksDelegate } }">{{
                                data.mostProducedBlocksDelegate }}</nuxt-link>
                        mined {{ data.mostProducedBlocks }} Blocks
                    </p>
                    <br v-if="status !== 'success'">
                    <i v-if="status !== 'success'" class="el-icon-loading"></i>
                </div>
                <div>
                    Highest Approval
                    <br v-if="status !== 'success'">
                    <i v-if="status !== 'success'" class="el-icon-loading"></i>
                    <p v-if="data">{{ data.highestApproval }}</p>
                </div>
                <div>
                    Highest Approval
                    <br v-if="status !== 'success'">
                    <i v-if="status !== 'success'" class="el-icon-loading"></i>
                    <p v-if="data">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'delegate-detail', query: { username: data.highestApprovalDelegate } }">
                            {{ data.highestApprovalDelegate }}
                        </nuxt-link>
                    </p>
                </div>
            </div>
        </el-card>

        <el-card class="second-card">
            <el-table :data="data?.allDelegates" stripe style="width: 100%"
                v-loading="status !== 'success'">
                <el-table-column prop="rate" label="Rank" width="60" align="center"></el-table-column>
                <el-table-column prop="username" label="Username" align="center" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'delegate-detail', query: { username: scope.row.username } }">
                            {{ scope.row.username }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 500" prop="prettyLockBalance" label="Locked Balance" align="center"
                    width="auto"></el-table-column>
                <el-table-column v-if="width >= 500" prop="prettyBalance" label="Unlocked Balance" align="center"
                    width="auto"></el-table-column>
                <el-table-column v-if="width >= 500" prop="producedBlocks" label="Produced Blocks" align="center"
                    width="auto"></el-table-column>
                <el-table-column v-if="width >= 500" prop="rewards" label="Rewards" align="center"
                    :formatter="formatRewards" width="auto"></el-table-column>
                <el-table-column v-if="width >= 800" prop="fees" label="Fees" align="center" :formatter="formatFees"
                    width="auto"></el-table-column>
                <el-table-column v-if="width >= 800" prop="missedBlocks" label="Missed Blocks" align="center"
                    width="auto"></el-table-column>
                <el-table-column v-if="width >= 800" prop="productivity" label="Productivity %" align="center"
                    :formatter="formatProductivity" width="auto"></el-table-column>
                <el-table-column v-if="width >= 800" prop="approval" label="Approval %" align="center"
                    width="auto"></el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import type { IDelegate, ExtendedDelegateViewModel } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';


export interface DelegateVM extends ExtendedDelegateViewModel {
    prettyBalance: string;
    prettyLockBalance: string;
    approval: string;
}


async function handleCurrentChange(row: IDelegate) {
    console.log(row.username);
    await navigateTo({
        path: '/delegate-detail',
        query: {
            username: row.username,
        }
    });
}


function formatRewards(row: DelegateVM, column: TableColumnCtx<DelegateVM>) {
    return new BigNumber(row.rewards).dividedBy(1e8).toFixed();
}

function formatFees(row: DelegateVM, column: TableColumnCtx<DelegateVM>) {
    // BigNumber.set({ DECIMAL_PLACES: 2 });
    return new BigNumber(row.fees).dividedBy(1e8).toFixed();
}


function formatProductivity(row: DelegateVM, column: TableColumnCtx<DelegateVM>) {
    return new BigNumber(row.productivity).times(100).decimalPlaces(4).toFixed();
}


const connection = useFoo();



const { data, error, status } = await useAsyncData(async () => {

    const countWrapper = await connection.value.api.Delegate.count();
    if (!countWrapper.success) {
        throw new Error('failed to fetch delegate count');
    }

    const count = countWrapper.count;
    let all: ExtendedDelegateViewModel[] = [];
    for (let offset = 0; offset < count; offset += 100) {
        const part = await connection.value.api.Delegate.getDelegates(String(offset), String(100));
        if (part.success) {
            all.push(...part.delegates);
        }
    }

    const vm: DelegateVM[] = all.map(x => {
        const one = {
            ...x,
            prettyBalance: new BigNumber(x.gny).dividedBy(1e8).toFixed(0),
            prettyLockBalance: new BigNumber(x.lockAmount).dividedBy(1e8).toFixed(0),
            approval: new BigNumber(x.approval).toFixed(6),
        };
        return one;
    });


    // Array.sort() changes own array (not only returned value)
    const copy: DelegateVM[] = JSON.parse(JSON.stringify(all));


    // approval
    const highestApproval = copy.sort((a, b) => {
        if (new BigNumber(a.approval).isGreaterThan(b.approval)) {
            return -1;
        }

        if (new BigNumber(a.approval).isLessThan(b.approval)) {
            return 1;
        }

        return 0;
    })[0];


    // produced Blocks
    const copy2: DelegateVM[] = JSON.parse(JSON.stringify(all));

    const mostProducedBlocks = copy2.sort((a, b) => {
        if (new BigNumber(a.producedBlocks).isGreaterThan(b.producedBlocks)) {
            return -1;
        }

        if (new BigNumber(a.producedBlocks).isLessThan(b.producedBlocks)) {
            return 1;
        }

        return 0;
    })[0];

    return {
        count,
        allDelegates: vm,

        highestApproval: highestApproval.approval.slice(0, 6) + ' %',
        highestApprovalDelegate: highestApproval.username,

        mostProducedBlocks: mostProducedBlocks.producedBlocks,
        mostProducedBlocksDelegate: mostProducedBlocks.username,
    };

});



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

.wrapper {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
}

.second-card {
    margin-top: 1.5rem;
}

@media screen and (min-width: 500px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

@media screen and (min-width: 700px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

@media screen and (min-width: 850px) {
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
</style>
