<template>
    <el-card>
        <h4 class="card-title">
            Holders
        </h4>

        <el-table :data="data?.holders" stripe v-loading="status !== 'success'">
            <el-table-column prop="address" align="center" label="Address" width="auto">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: table.row.address } }">
                        {{ table.row.address.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="currency" align="center" label="Currency" width="auto"></el-table-column>
            <el-table-column v-if="width >= 500" prop="balance" label="Balance" :formatter="formatBalance"
                width="auto"></el-table-column>
        </el-table>

        <el-pagination :disabled="status !== 'success'"
            class="center-horizontally"
            v-model:current-page="currentPage"
            :page-size="5"
            layout="prev, pager, next"
            :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">
import BigNumber from 'bignumber.js';


const props = defineProps({
    assetName: {
        type: String,
        required: true,
    },
});
const assetName = ref(props.assetName);


const connection = useFoo();
const currentPage = ref(1);

const { data, error, status } = await useAsyncData(async () => {

    if (!assetName.value) {
        throw new Error('[AssetCurrentHolders] assetName prop is not defined');
    }

    const assetRaw = await connection.value.api.Uia.getAsset(assetName.value);
    if (!assetRaw.success) {
        throw new Error('[AssetCurrentHolders] could not fetch asset');
    }
    console.log(`asset: ${JSON.stringify(assetRaw.asset, null, 2)}`);


    const limit = 5;
    const offset = (currentPage.value - 1) * limit;

    const holdersRaw = await connection.value.api.Uia.getHolders(assetName.value, limit, offset);
    if (!holdersRaw.success) {
        throw new Error('failed to fetch holders');
    }
    const holders = holdersRaw.holders.map(holder => ({
        ...holder,
        asset: assetRaw.asset,
    }));
    console.log(`holders: ${JSON.stringify(holders, null, 2)}`);

    return {
        holders: holders,
        count: holdersRaw.count,
    };
}, {
    lazy: true,
    watch: [assetName, currentPage],
});

function formatBalance(row, column) {
    return new BigNumber(row.balance).dividedBy(row.asset.precision).toFixed();
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
