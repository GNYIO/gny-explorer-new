<template>
    <el-card>
        <h4 class="card-title">
            Assets
        </h4>

        <el-table :data="data?.assets" stripe v-loading="loading">
            <el-table-column prop="name" align="center" label="Name" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'asset-detail', query: { assetName: scope.row.name } }">
                        {{ scope.row.name }}
                    </nuxt-link>
                </template>
            </el-table-column>
            <el-table-column v-if="width >= 800" prop="desc" align="center" label="Description"
                width="auto"></el-table-column>
            <el-table-column v-if="width >= 850" prop="timestamp" align="center" label="Forged Time" width="200"
                :formatter="timestamp2date"></el-table-column>
            <el-table-column v-if="width >= 550" prop="leftToIssuePretty" align="center" label="Tokens Left To Issue"
                width="auto"></el-table-column>
            <el-table-column prop="issuerId" align="center" label="Issuer" width="auto" :formatter="subIssuerId">
                <template v-slot:default="table">
                    <nuxt-link class="nuxt-link" :to="{
                        name: 'account-detail',
                        query: { address: table.row.issuerId }
                    }">
                        {{ subIssuerId(table.row.issuerId) }}
                    </nuxt-link>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination :disabled="loading" class="center-horizontally" v-model:current-page="currentPage" :page-size="5"
            layout="prev, pager, next" :total="data?.count" />
    </el-card>
</template>


<script setup lang="ts">
import moment from 'moment'
import { slots } from '@gnyio/utils'
import { BigNumber } from 'bignumber.js'


const loading = ref(true);
const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    loading.value = true;

    const limit = 5;
    const offset = (currentPage.value - 1) * limit;

    const assetsRaw = await connection.value.api.Uia.getAssets(limit, offset);
    if (!assetsRaw.success) {
        throw new Error('[pages/assets.vue] failed to load assets');
    }

    const assets = assetsRaw.assets.map(x => makeAssetPretty(x));

    loading.value = false;

    return {
        assets,
        count: assetsRaw.count,
    };
}, {
    lazy: true,
    watch: [currentPage],
});


function subTransactionId(row, column) {
    return row.tid.slice(0, 8)
}

function subIssuerId(issuerId) {
    return issuerId.slice(0, 8)
}

function timestamp2date(row, column) {
    return moment.utc(slots.getRealTime(row.timestamp)).format(
        'YYYY-MM-DD HH:mm:ss UTC'
    )
}

function makeAssetPretty(asset) {
    const prec = Math.pow(10, asset.precision)
    const difference = new BigNumber(asset.maximum)
        .minus(asset.quantity)
        .toFixed()

    const one = {
        tid: asset.tid,
        name: asset.name,
        precision: asset.precision,
        maximum: asset.maximum,
        maximumPretty: new BigNumber(asset.maximum).dividedBy(prec).toFixed(),
        quantity: asset.quantity,
        quantityPretty: new BigNumber(asset.quantity).dividedBy(prec).toFixed(),
        leftToIssue: difference,
        leftToIssuePretty: new BigNumber(difference).dividedBy(prec).toFixed(),
        desc: asset.desc,
        issuerId: asset.issuerId
    }
    return one;
}

function handleCurrentChange(currentPage) {
    this.currentPage = currentPage
    this.changePage(this.assets, currentPage)
}

function changePage(list, currentPage) {
    let from = (currentPage - 1) * this.pageSize
    let to = currentPage * this.pageSize
    this.currentAssets = []
    for (; from < to; from++) {
        if (list[from]) {
            this.currentAssets.push(list[from])
        }
    }
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

.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}
</style>