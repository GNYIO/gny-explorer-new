<template>


    <el-card class="card-space">
        <h4 class="card-title">
            {{ formatTitle }}
        </h4>

        <el-table :data="croppedVotes" stripe v-loading="loading">

            <el-table-column prop="rate" align="center" label="Rank" width="auto"></el-table-column>

            <el-table-column prop="username" align="center" label="Delegate">
                <template v-slot:default="table" width="auto">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'delegate-detail', query: { username: table.row.username } }">{{ table.row.username
                        }}</nuxt-link>
                </template>
            </el-table-column>

            <el-table-column v-if="width >= 500" prop="producedBlocks" align="center" label="Produced Blocks"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 800" prop="missedBlocks" align="center" label="Missed Blocks"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 1200" prop="votes" align="center" label="Overall Vote Weight (GNY)"
                :formatter="voteWeightFormatter" width="200"></el-table-column>
            <el-table-column v-if="width >= 1000" prop="approval" align="center" label="Approval"
                width="auto"></el-table-column>

        </el-table>

        <el-pagination :disabled="loading"
            class="center-horizontally"
            v-model:current-page="currentPage"
            :page-size="5"
            layout="prev, pager, next"
            :total="data?.count" />
    </el-card>
</template>


<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import type { IDelegate } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';


const formatTitle = computed(() => `Who I Voted For ${data.value ? `(total: ${data.value.count}` : ''})`);

const connection = useFoo();



const props = defineProps({
    addressOfVoter: {
        required: true,
        type: String,
    },
});

const propsRef = ref(props.addressOfVoter);


const loading = ref(true);

const { data, error, status } = await useAsyncData(async () => {

    loading.value = true;

    const address = propsRef.value;
    console.log(`(WhoIVotedFor) address of voter changed to "${address}"`);

    if (!address) {
        throw new Error('incoming address not defined');
    }

    const query = {
        address: address,
    };

    // this endpoint is not paged because it only returns
    // up to 33 votes
    const raw = await connection.value.api.Delegate.getOwnVotes(query);
    if (!raw.success) {
        throw new Error('could not fetch own votes');
    }

    loading.value = false;

    return {
        delegates: raw.delegates,
        count: raw.delegates.length,
    };
}, {
    lazy: true,
    watch: [propsRef],
});


const currentPage = ref(1);

const croppedVotes = computed(() => {
    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;

    if (data.value?.delegates) {
        const result = data.value.delegates.slice(from, from + pageSize);
        return result;
    }

    const empty: IDelegate[] = [];
    return empty;
});


function voteWeightFormatter(row: IDelegate, column: TableColumnCtx<IDelegate>) {
    return new BigNumber(row.votes).dividedBy(1e8).toFixed();
}

const { width } = useWindowSize();

</script>



<style scoped>
.el-card {
    margin-top: 20px;
}

.nuxt-link {
    color: #2475ba;
    cursor: pointer;
}

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

.card-space {
    margin-top: 1.5rem;
}
</style>
