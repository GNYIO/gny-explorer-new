<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Account info
            </h4>


            <div class="wrapper">
                <div>
                    Address
                    <p v-if="data">{{ data.account.address }}</p>
                </div>
                <div>
                    Unlocked Balance
                    <p v-if="data">{{ BigNumber(data.account.gny).dividedBy(1e8).toFixed(0) }} GNY</p>
                </div>
                <div>
                    Locked Balance
                    <el-tooltip effect="dark" placement="bottom" v-if="data">
                        <template v-if="data" #content>{{ BigNumber(data.account.lockAmount).dividedBy(1e8).toFixed(0)
                            }} available to unlock at
                            height {{ data.account.lockHeight }}</template>
                        <p>{{ data.account.lockAmount }} GNY</p>
                    </el-tooltip>
                </div>
                <div>
                    Total Balance
                    <el-tooltip effect="dark" placement="bottom" v-if="data">
                        <template #content>Unlocked Balance ({{ BigNumber(data.account.gny).dividedBy(1e8).toFixed(0) }}
                            GNY) plus locked Balance ({{
                                data.account.lockAmount }}
                            GNY ) = {{
                                BigNumber(data.account.gny).plus(data.account.lockAmount).dividedBy(1e8).toFixed(0) }}
                            GNY</template>
                        <p>{{ BigNumber(data.account.gny).plus(data.account.lockAmount).dividedBy(1e8).toFixed(0) }}
                        </p>
                    </el-tooltip>
                </div>
                <div>
                    Username
                    <p v-if="data">{{ data.account.username }}</p>
                    <p v-else>Not set</p>
                </div>
                <div>
                    Public Key
                    <p v-if="data && data.account.publicKey">{{ data.account.publicKey }}</p>
                    <p v-else>Not set</p>
                </div>
                <div>
                    Delegate
                    <p v-if="data?.account.isDelegate"><nuxt-link
                            :to="{ name: 'delegate-detail', query: { username: data.account.username } }">Details</nuxt-link>
                    </p>
                    <p v-else>False</p>
                </div>
            </div>
        </el-card>

        <!-- <visualization-component :address="address"></visualization-component> -->

        <!-- <custom-assets-component :senderAddress="address"></custom-assets-component> -->

        <TransactionsISent v-if="data" :senderAddress="data.account.address" />
   
        <!--
        <asset-transfers-component :senderAddress="address"></asset-transfers-component>

        <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component>

        <burnings-component :senderAddress="address"></burnings-component>

        <dat-makers-component :address="address"></dat-makers-component>

        <dats-component :ownerAddress="address"></dats-component> -->
    </div>
</template>

<script setup lang="ts">
import BigNumber from 'bignumber.js';
import type { IAccount } from '@gnyio/interfaces';
import TransactionsISent from '~/components/TransactionsISent.vue';

// import TransactionsISentComponent from '../components/TransactionsISent.vue';
// import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';
// import CustomAssetsComponent from '../components/CustomAssets.vue';
// import AssetTransfersComponent from '../components/AssetTransfers.vue';
// import VisualizationComponent from '../components/Visualization.vue';
// import BurningsComponent from '../components/Burnings.vue';
// import DatMakersComponent from '../components/DatMakers.vue';
// import DatsComponent from '../components/Dats.vue';


const connection = useFoo();
const route = useRoute();

const routeQuery = computed(() => route.query)


const { data, status, error } = await useAsyncData(async () => {

    const query = routeQuery.value;
    console.log(`reactive query: ${JSON.stringify(query, null, 2)}`);

    const potentialAddress = routeQuery.value['address'];
    const potentialUsername = routeQuery.value['username'];

    // https://dushkin.tech/posts/js_assign_variable_in_switch/
    const account: IAccount = await (async function () {
        if (typeof potentialAddress === 'string') {
            const result = await connection.value.api.Account.getAccountByAddress(potentialAddress);
            if (result.success) {
                return result;
            }
        }

        if (typeof potentialUsername === 'string') {
            const result = await connection.value.api.Account.getAccountByUsername(potentialUsername);
            if (result.success) {
                return result;
            }
        }

        throw new Error('failed to fetch either ')
    })();

    // this.isLocked = account.isLocked === '0' ? false : true;

    return {
        account,
    };
}, {
    lazy: true,
    watch: [routeQuery],
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

/* changed */
@media screen and (min-width: 700px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

/* changed */
@media screen and (min-width: 1000px) {
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