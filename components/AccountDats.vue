<template>
    <el-card>
        <h4 class="card-title">
            My Registered DATs (total: {{ data?.count }})
        </h4>

        <el-table class="clickable-rows" :data="data?.dats" stripe v-loading="status !== 'success'">
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
            <el-table-column v-if="width >= 600" prop="previousHash" align="center" label="Previous Hash" width="auto">
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
            <el-table-column v-if="width >= 800" prop="ownerAddress" align="center" label="Owner Address" width="auto">
                <template #default="scope">
                    <nuxt-link class="nuxt-link"
                        :to="{ name: 'account-detail', query: { address: scope.row.ownerAddress } }">
                        {{ scope.row.ownerAddress.slice(0, 6) }}
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
        </el-table>

        <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
            :page-size="5" layout="prev, pager, next" :total="data?.count" />

    </el-card>
</template>


<script setup lang="ts">

const props = defineProps({
    ownerAddress: {
        required: true,
        type: String,
    },
});

const ownerAddress = ref(props.ownerAddress);
const currentPage = ref(1);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

    const val = ownerAddress.value;
    if (!val) {
        throw new Error('[AccountDats] ownerAddress prop is undefined');
    }

    const pageSize = 5;
    const from = (currentPage.value - 1) * pageSize;

    const raw = await connection.value.api.Dat.getDats({
        offset: from,
        limit: pageSize,
        ownerAddress: val,
    });
    if (!raw.success) {
        throw new Error('[AccountDats] could not fetch Dats of account');
    }

    return {
        dats: raw.dats,
        count: raw.count,
    };
}, {
    lazy: true,
    watch: [ownerAddress, currentPage],
});

const { width } = useWindowSize();

</script>
