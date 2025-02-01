<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Asset Info
            </h4>

            <div class="wrapper">
                <div v-if="data">
                    Name
                    <p>{{ data.asset.name }}</p>
                </div>
                <div v-if="data">
                    Description
                    <p>{{ data.asset.desc }}</p>
                </div>
                <div v-if="data">
                    Issuer Name
                    <p>{{ data.issuer.name }}</p>
                </div>
                <div v-if="data">
                    Issuer Account
                    <p>
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'account-detail', query: { address: data.asset.issuerId } }">
                            {{ data.asset.issuerId.slice(0, 12) }}
                        </nuxt-link>
                    </p>
                </div>
                <div v-if="data">
                    Precision
                    <p>{{ data.asset.precision }}</p>
                </div>
                <div v-if="data">
                    Maximum
                    <p>{{ data.asset.maximumPretty }}</p>
                </div>
                <div v-if="data">
                    Left to Issue
                    <p>{{ data.asset.leftToIssuePretty }}</p>
                </div>
                <div v-if="data">
                    Asset Registration
                    <p>
                        <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: data.asset.tid } }">
                            {{ data.asset.tid.slice(0, 12) }}
                        </nuxt-link>
                    </p>
                </div>
            </div>
        </el-card>

    <AssetIssuer v-if="data" :issuerId="data?.asset.issuerId" />

    <AssetTransaction v-if="data" :issuerId="data?.asset.issuerId" />

    <AssetIssueTransactions v-if="data" :issuerId="data?.asset.issuerId" />

    <UiaAssetTransfers v-if="data" :assetName="data?.asset.name" />

    <AssetCurrentHolders v-if="data" :assetName="data?.asset.name" />

    </div>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js';
import type { IAssetWithIssuer } from '@gnyio/interfaces';

const connection = useFoo();


// asset: {},
// assetIssuerId: '',
// assetTid: '',
// issuer: {},
// precision: '',
// issuerTransactions: [],
// assetTransactions: [],
// issueTransactions: [],
// transfers: [],
// holders: [],
// transfersCount: 0,
// currentTransfers: [],
// currentTransfersPage: 1,
// holdersCount: 0,
// currentHolders: [],
// currentHoldersPage: 1,
// pageSize: 10,
// issuerLoading: true,
// assetLoading: true,
// issueLoading: true,
// transferLoading: true,
// holdersLoading: true,

function makeAssetPretty(asset: IAssetWithIssuer) {
    const prec = Math.pow(10, asset.precision);
    const difference = new BigNumber(asset.maximum)
        .minus(asset.quantity)
        .toFixed();

    console.log(`asset-raw: ${JSON.stringify(asset, null, 2)}`);
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
        issuerId: asset.issuerId,
    };
    return one;
}


const route = useRoute();
const routeQuery = computed(() => route.query);


const { data, error, status } = await useAsyncData(async () => {

    const val = routeQuery.value;
    console.log(`[asset-detail] query changed: ${JSON.stringify(val, null, 2)}`);
    if (typeof val.assetName !== 'string') {
        throw new Error('assetName query parameter not defined');
    }

    const assetRaw = await connection.value.api.Uia.getAsset(val.assetName);
    if (!assetRaw.success) {
        throw new Error('failed to fetch asset');
    }
    const asset = makeAssetPretty(assetRaw.asset);


    const issuerName = asset.name.split('.')[0];
    const issuerRaw = await connection.value.api.Uia.getIssuer(issuerName);
    if (!issuerRaw.success) {
        throw new Error('failed to fetch issuer of asset');
    }
    const issuer = issuerRaw.issuer;


    return {
        asset,
        issuer,
    };


    // const assetIssuerId = asset.issuerId.slice(0, 12);
    // // this.assetTid = asset.tid.slice(0, 12);
    // // this.precision = Math.pow(10, result.precision);


    // this.issuerTransactions = (await connection.api.Transaction.getTransactions({ senderId: result.issuerId, type: 100 })).transactions;

    // if (this.issuerTransactions.length >= 0) {
    //     this.issuerLoading = false;
    // }

    // this.assetTransactions = (await connection.api.Transaction.getTransactions({ senderId: result.issuerId, type: 101 })).transactions;

    // if (this.assetTransactions.length >= 0) {
    //     this.assetLoading = false;
    // }

    // this.issueTransactions = (await connection.api.Transaction.getTransactions({ senderId: result.issuerId, type: 102 })).transactions;

    // if (this.issueTransactions.length >= 0) {
    //     this.issueLoading = false;
    // }

    // const allTransfers = (await connection.api.Transaction.getTransactions({ type: 103 })).transactions.reverse();

    // this.transfers = allTransfers.filter(function (transfer) {
    //     return JSON.parse(transfer.args)[0] === result.name;
    // })

    // this.transfersCount = this.transfers.length;

    // if (this.transfersCount >= 0) {
    //     this.transferLoading = false;
    // }

    // this.holders = (await connection.api.Uia.getHolders(assetName)).holders;

    // this.holdersCount = this.holders.length;

    // if (this.holdersCount >= 0) {
    //     this.holdersLoading = false;
    // }

}, {
    lazy: true,
    watch: [routeQuery],
});

function handleCurrentTransfersChange(currentPage) {
    this.currentTransfersPage = currentPage;
    this.changeTransfersPage(this.transfers, currentPage);
}

function changeTransfersPage(list, currentPage) {
    let from = (currentPage - 1) * this.pageSize;
    let to = currentPage * this.pageSize;
    this.currentTransfers = [];
    for (; from < to; from++) {
        if (list[from]) {
            this.currentTransfers.push(list[from]);
        }
    }
}

function handleCurrentHoldersChange(currentPage) {
    this.currentHoldersPage = currentPage;
    this.changeHoldersPage(this.holders, currentPage);
}

function changeHoldersPage(list, currentPage) {
    let from = (currentPage - 1) * this.pageSize;
    let to = currentPage * this.pageSize;
    this.currentHolders = [];
    for (; from < to; from++) {
        if (list[from]) {
            this.currentHolders.push(list[from]);
        }
    }
}


// async mounted() {
//     const assetName = this.$route.query.assetName;
//     await this.updatePage(assetName);

//     this.handleCurrentTransfersChange(1);
//     this.handleCurrentHoldersChange(1);
// }


const { width } = useWindowSize();

</script>

<style scoped>
.card {
    margin-bottom: 2rem;
}

.wrapper {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
}

@media screen and (min-width: 300px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

@media screen and (min-width: 500px) {
    .wrapper {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (min-width: 800px) {
    .wrapper {
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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