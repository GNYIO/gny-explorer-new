<script setup lang="ts">
import BigNumber from 'bignumber.js';

const connection = useFoo();

const { data, error, status, } = await useAsyncData(async () => {
    const heightRaw = await connection.value.api.Block.getHeight();
    if (!heightRaw.success) {
        throw new Error('failed to fetch height');
    }
    const blocksCount = new BigNumber(heightRaw.height).plus(1).toFixed();


    const trsCountRaw = await connection.value.api.Transaction.getCount()
    if (!trsCountRaw.success) {
        throw new Error('failed to fetch trs count');
    }

    const blocksRaw = await connection.value.api.Block.getBlocks(
        "0",
        "5",
        "height:desc"
    );
    if (!blocksRaw.success) {
        throw new Error('failed to fetch blocks');
    }

    const transOffset = Number(trsCountRaw.count) - 5;
    const trsRaw = await connection.value.api.Transaction.getTransactions({
        limit: 5,
        offset: transOffset,
    });
    if (!trsRaw.success) {
        throw new Error('failed to fetch trs');
    }

    return {
        blocksCount,
        transactions: trsCountRaw.count,
        latestHeight: heightRaw.height,
        blocks: blocksRaw.blocks,
        latestTransactions: trsRaw.transactions.reverse(),
    };
}, {
    lazy: true,
});

</script>

<template>
    <el-container direction="vertical">
        <div>
            <div v-if="status === 'success' && data">
                <basic :blocksCount="data.blocksCount" :transactions="data.transactions"
                    :latestHeight="data.latestHeight"></basic>

                <block :blocks="data.blocks" :blocksLoading="status !== 'success'"></block>

            </div>
            <div v-if="error"> Error {{ error.message }} </div>
        </div>
    </el-container>
</template>


<style scoped>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 0rem 0rem;
}
</style>

