<template>
    <!--Asset Transfers-->
    <el-card>
        Asset Transfers (total: {{ data?.count || 0 }})


        <el-table :data="data?.transfers" style="width: 100%" v-loading="status !== 'success'">
            <el-table-column prop="amount" align="center" label="Amount" :formatter="prettyPrintAmount"
                width="auto"></el-table-column>

            <el-table-column v-if="width >= 500" prop="currency" align="center" label="Currency" width="auto">
                <template #default="scope">
                    <span v-if="scope.row.currency === 'GNY'">GNY</span>
                    <nuxt-link v-else class="nuxt-link"
                        :to="{ name: 'asset-detail', query: { assetName: scope.row.currency } }">{{
                            scope.row.currency }}</nuxt-link>
                </template>
            </el-table-column>

            <el-table-column v-if="width >= 500" prop="senderId" label="Sender" align="center" width="auto">
                <template #default="scope">
                    <span v-if="senderAddress === scope.row.senderId">ME</span>
                    <nuxt-link v-else class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
                        {{ scope.row.senderId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>

            <el-table-column v-if="width >= 500" prop="recipientId" label="Recipient" align="center" width="auto">
                <template #default="scope">
                    <span v-if="senderAddress === scope.row.recipientId">ME</span>
                    <nuxt-link v-else class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.recipientId } }">
                        {{ scope.row.recipientId.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>

            <el-table-column prop="tid" align="center" label="TX ID" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                        {{ scope.row.tid.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>

            <el-table-column v-if="width >= 800" prop="height" align="center" label="Height" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
                        {{ scope.row.height }}
                    </nuxt-link>
                </template>
            </el-table-column>

        </el-table>
        <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
            :page-size="5" layout="prev, pager, next" :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">
import type { IAssetWithIssuer } from '@gnyio/interfaces';
import BigNumber from 'bignumber.js';

const props = defineProps({
    senderAddress: {
        required: true,
        type: String,
    }
});

const senderAddress = ref(props.senderAddress);
const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = useAsyncData(async () => {

    const val = senderAddress.value;
    if (!val) {
        throw new Error('senderAddress prop is not defined');
    }

    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;
    const query = {
        ownerId: val,
        limit: pageSize,
        offset: from,
    };
    const raw = await connection.value.api.Transfer.getRoot(query);
    if (!raw.success) {
        throw new Error('could not get account transfers');
    }


    // get asset names from downloaded transfers
    const allAssets = raw.transfers.map(x => x.currency);
    const allAssetsNoDuplicates = [...new Set(allAssets)]; // remove duplicates

    const assets: IAssetWithIssuer[] = [];
    for (let i = 0; i < allAssetsNoDuplicates.length; ++i) {
        if (allAssetsNoDuplicates[i] === 'GNY') {
            continue;
        }
        const rawAsset = await connection.value.api.Uia.getAsset(allAssetsNoDuplicates[i]);
        if (!rawAsset.success) {
            throw new Error('failed to fetch assets');
        }
        assets.push(rawAsset.asset);
    }
    // add precision to every transfer item
    const transfers = raw.transfers.map(trans => {
        if (trans.currency === 'GNY') {
            trans.precision = 8;
        } else {
            const customAssetPrecision = assets.filter(oneAsset => {
                return oneAsset.name === trans.currency;
            })[0].precision;
            trans.precision = customAssetPrecision;
        }
        return trans;
    });

    return {
        transfers,
        count: raw.count,
    };

}, {
    lazy: true,
    watch: [senderAddress, currentPage],
});

function prettyPrintAmount(row: any, column: any) {
    const prec = Math.pow(10, row.precision);
    return new BigNumber(row.amount).dividedBy(prec).toFixed();
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
