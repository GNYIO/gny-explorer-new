<template>
    <el-card>
        <h4 class="card-title">
            My Registered DATMakers (total: {{ data?.count || 0 }})
        </h4>

        <el-table class="clickable-rows" :data="data?.makers" stripe v-loading="status !== 'success'">

            <el-table-column prop="name" align="center" label="name" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'dat-maker-detail', query: { makerId: scope.row.name } }">
                        {{ scope.row.name }}
                    </nuxt-link>
                </template>
            </el-table-column>

            <el-table-column prop="desc" align="center" label="description" :formatter="subDes"></el-table-column>

            <el-table-column prop="tid" align="center" label="Register Trs">
                <template #default="scope">
                    <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
                        {{ scope.row.tid.slice(0, 8) }}
                    </nuxt-link>
                </template>
            </el-table-column>

            <el-table-column prop="datCounter" align="center" label="# of DATs created"></el-table-column>
        </el-table>

        <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
            :page-size="5" layout="prev, pager, next" :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">



const props = defineProps({
    address: {
        required: true,
        type: String,
    },
});

const address = ref(props.address);
const currentPage = ref(1);

const connection = useFoo()

const { data, status, error } = await useAsyncData(async () => {

    const val = address.value;
    if (!val) {
        throw new Error('[AccountDatMaker] prop address is undefined');
    }

    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;

    const raw = await connection.value.api.Dat.getDatMakers(from, pageSize, val);
    if (!raw.success) {
        throw new Error('[AccountDatMaker] could get DAT Makers');
    }

    console.log(`dats: ${JSON.stringify(raw, null, 2)}`);

    return {
        makers: raw.makers,
        count: raw.count,
    };

}, {
    lazy: true,
    watch: [address, currentPage],
});


function subDes(row: any, column: any) {
    return row.desc.slice(0, 8) + '...';
}

</script>


<style>
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
