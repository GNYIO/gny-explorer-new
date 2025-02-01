<template>
    <el-card>
        <h4 class="card-title">
            Custom Assets (total: {{ data?.count }})
        </h4>

        <el-table class="clickable-rows" :data="data?.assets" stripe v-loading="status !== 'success'">
            <el-table-column prop="currency" align="center" label="Currency" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'asset-detail', query: { assetName: scope.row.currency } }">
                        {{ scope.row.currency }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="balance" align="center" label="Balance" width="auto"
                :formatter="prettyPrintAssetAmount"></el-table-column>
            <el-table-column v-if="width > 600" prop="flag" align="center" label="Flag" width="auto"></el-table-column>
        </el-table>

        <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
            :page-size="5" layout="prev, pager, next" :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">
import BigNumber from 'bignumber.js';

const props = defineProps({
    senderAddress: {
        required: true,
        type: String,
    },
});

const senderAddress = ref(props.senderAddress);
const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    const val = senderAddress.value;
    if (!val) {
        throw new Error('senderAddress prop is not defined');
    }

    console.log(`[CustomAssets.vue] senderAddress: ${senderAddress}`);

    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;

    const raw = await connection.value.api.Uia.getBalances(val, pageSize, from);
    if (!raw.success) {
        throw new Error('failed to fetch balances of uia');
    }

    const balances = raw.balances;

    const assets = [];

    for (let i = 0; i < balances.length; i++) {
        const currency = balances[i].currency;

        const raw = await connection.value.api.Uia.getAsset(currency);
        if (!raw.success) {
            throw new Error('failed to fetch currency information');
        }

        const precision = raw.asset.precision;

        assets.push({
            ...balances[i],
            precision: precision,
        });
    }

    return {
        assets,
        count: raw.count,
    };
}, {
    lazy: true,
    watch: [senderAddress, currentPage],
});


function prettyPrintAssetAmount(row: any, column: any) {
    const prec = Math.pow(10, row.precision);
    const result = new BigNumber(row.balance).dividedBy(prec).toFixed();
    return result;
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
