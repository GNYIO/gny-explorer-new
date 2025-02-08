<template>
    <div>
        <el-card title="DATs Overview" class="shadow">
            <div class="wrapper">
                <div v-if="data">
                    DATs
                    <p>{{ data.count }}</p>
                </div>
                <div v-if="makerData">
                    DAT Makers
                    <p>{{ makerData.count }}</p>
                </div>
            </div>
        </el-card>

        <el-card class="card-space">
            <h4 class="card-title">
                All DATs
            </h4>

            <el-table :data="data?.dats" stripe height="300" v-loading="status !== 'success'">
                <el-table-column prop="name" align="center" label="Dat Name" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'dat-detail', query: { name: scope.row.name } }">
                            {{ scope.row.name.split('.')[1].slice(0, 7) + '...' }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column prop="datMakerId" align="center" label="Dat Maker" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'dat-maker-detail', query: { makerId: scope.row.datMakerId } }">
                            {{ scope.row.datMakerId.slice(0, 8) }}
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
                        <span v-else>no hash</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 800" prop="tid" align="center" label="Transaction ID" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                            {{ scope.row.tid.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
                <el-table-column v-if="width >= 800" prop="ownerAddress" align="center" label="Owner Address"
                    width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'account-detail', query: { address: scope.row.ownerAddress } }">
                            {{ scope.row.ownerAddress.slice(0, 6) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination :disabled="status !== 'success'" class="center-horizontally"
                v-model:current-page="currentDatPage" :page-size="5" layout="prev, pager, next" :total="data?.count" />

        </el-card>


        <el-card title="" class="card-space">
            <h4 class="card-title">
                All DAT Makers
            </h4>

            <el-table :data="makerData?.makers" stripe height="300" v-loading="makerStatus !== 'success'">
                <el-table-column prop="name" align="center" label="Maker Name" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'dat-maker-detail', query: { makerId: scope.row.name } }">
                            {{ scope.row.name.slice(0, 7) }}
                        </nuxt-link>
                    </template>
                </el-table-column>

                <el-table-column v-if="width >= 400" prop="desc" align="center" label="Description">
                    <template #default="scope">
                        {{ scope.row.desc.slice(0, 8) }}
                    </template>
                </el-table-column>

                <el-table-column v-if="width >= 800" prop="datCounter" align="center" label="# of DATs">
                </el-table-column>

                <el-table-column v-if="width >= 800" prop="address" label="Address" align="center">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link"
                            :to="{ name: 'account-detail', query: { address: scope.row.address } }">
                            {{ scope.row.address.slice(0, 6) }}
                        </nuxt-link>
                    </template>
                </el-table-column>

                <el-table-column v-if="width >= 800" prop="tid" align="center" label="TID" width="auto">
                    <template #default="scope">
                        <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                            {{ scope.row.tid.slice(0, 8) }}
                        </nuxt-link>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination :disabled="makerStatus !== 'success'" class="center-horizontally"
                v-model:current-page="currentMakersPage" :page-size="5" layout="prev, pager, next"
                :total="makerData?.count" />


        </el-card>

    </div>
</template>

<script setup lang="ts">
const connection = useFoo();

const currentDatPage = ref(1);
const currentMakersPage = ref(1);

// only dats
const { data, error, status } = await useAsyncData(async () => {

    const pageSize = 5;
    const from = (currentDatPage.value - 1) * pageSize;

    const raw = await connection.value.api.Dat.getDats({ offset: from, limit: pageSize });
    if (!raw.success) {
        throw new Error('failed to fetch DATs');
    }

    return {
        dats: raw.dats,
        count: raw.count,
    };
}, {
    lazy: true,
    watch: [currentDatPage],
});



const { data: makerData, error: makerError, status: makerStatus } = await useAsyncData(async () => {

    const makerPageSize = 5;
    const from = (currentMakersPage.value - 1) * makerPageSize;
    const offset = from;
    const limit = makerPageSize;

    const raw = await connection.value.api.Dat.getDatMakers(offset, limit);
    if (!raw.success) {
        throw new Error('failed to fetch DatMakers');
    }

    return {
        makers: raw.makers,
        count: raw.count,
    };
}, {
    lazy: true,
    watch: [currentMakersPage],
});

const { width } = useWindowSize();

</script>

<style scoped>
.card-space {
    margin-top: 1.5rem;
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

.center-horizontally {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
}
</style>