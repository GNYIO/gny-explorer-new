<template>
    <div>
        <el-card>
            <h4 class="card-title">
                Maker Info
            </h4>

            <div class="wrapper">
                <div>
                    Name
                    <p>{{ data?.maker.name }}</p>
                </div>
                <div>
                    Description
                    <p>{{ data?.maker.desc }}</p>
                </div>
                <div>
                    Address
                    <p v-if="data">
                        <nuxt-link :to="{ name: 'account-detail', query: { address: data.maker.address } }">{{
                            data.maker.address.slice(0, 12) }}</nuxt-link>
                    </p>
                </div>
                <div>
                    Registration Transaction
                    <p v-if="data">
                        <nuxt-link :to="{ name: 'transaction-detail', query: { tid: data.maker.tid } }">{{
                            data.maker.tid.slice(0, 12) }}</nuxt-link>
                    </p>
                </div>
                <div>
                    DATs created
                    <p>{{ data?.maker.datCounter }}</p>
                </div>
                <div>
                    Creation Time
                    <p>{{ timestamp2date(data?.maker.timestamp || 1) }}</p>
                </div>


            </div>
        </el-card>

        <br />

        <el-card>
            <h4 class="card-title">
                My DATs
            </h4>

            <el-table :data="data?.dats" stripe height="300" v-loading="status !== 'success'">
                <el-table-column prop="name" align="center" label="Dat Name" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'dat-detail', query: { name: scope.row.name } }">
                            {{ scope.row.name.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 600" prop="hash" align="center" label="Dat Hash" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'dat-detail', query: { hash: scope.row.hash } }">
                            {{ scope.row.hash.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 600" prop="previousHash" align="center" label="Previous Hash"
                    width="auto">
                    <template #default="scope">
                        <nuxt-link v-if="scope.row.previousHash !== null" class="nuxt-link"
                            :to="{ name: 'dat-detail', query: { hash: scope.row.previousHash } }">
                            {{ scope.row.previousHash.slice(0, 8) }}
                        </nuxt-link>
                        <span v-else>no previous hash</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 800" prop="tid" align="center" label="Transaction ID" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                            {{ scope.row.tid.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination :disabled="status !== 'success'" class="center-horizontally"
                v-model:current-page="currentPage" :page-size="5" layout="prev, pager, next" :total="data?.count" />
        </el-card>

    </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';

const route = useRoute();
const routeQuery = computed(() => route.query);
const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    const val = routeQuery.value;
    console.log(`[dat-maker-detail] query changed: ${JSON.stringify(val, null, 2)}`);
    if (typeof val.makerId !== 'string') {
        throw new Error('assetName query parameter not defined');
    }
    const raw = await connection.value.api.Dat.getSingleDatMaker(val.makerId);
    if (!raw.success) {
        throw new Error('[dat-maker-detail] failed to fetch dat maker');
    }

    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;

    const rawDats = await connection.value.api.Dat.getDats({
        offset: from,
        limit: pageSize,
        maker: val.makerId,
    });
    if (!rawDats.success) {
        throw new Error('[dat-maker-detail] failed to fetch DATs of this DAT Maker');
    }

    return {
        maker: raw.maker,
        dats: rawDats.dats,
        count: rawDats.count,
    };
}, {
    lazy: true,
    watch: [routeQuery, currentPage],
});

function timestamp2date(timestamp: number) {
    return moment.utc(slots.getRealTime(timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
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

.wrapper {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
}

/* changed from 300px to 650 */
@media screen and (min-width: 650px) {
    .wrapper {
        grid-template-columns: 1fr 1fr;
    }
}

/* removed one media query */

@media screen and (min-width: 800px) {
    .wrapper {
        grid-template-columns: 1fr 1fr 1fr;
    }
}
</style>
