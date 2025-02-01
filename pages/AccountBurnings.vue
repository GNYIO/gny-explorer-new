<template>
  <el-card>
    <h4 class="card-title">
      My GNY Burnings (total: {{ data?.count || 0 }})
    </h4>

    <el-table class="clickable-rows" :data="data?.burnings" stripe v-loading="status !== 'success'">
      <el-table-column prop="amount" align="center" label="Amount" :formatter="formatAmount"></el-table-column>
      <el-table-column v-if="width > 300" width="75" prop="height" align="center" label="Height"></el-table-column>
      <el-table-column prop="tid" align="center" width="auto" label="Transaction ID">
        <template #default="scope">
          <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.tid } }">
            {{ scope.row.tid.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination :disabled="status !== 'success'" class="center-horizontally" v-model:current-page="currentPage"
      :page-size="5" layout="prev, pager, next" :total="data?.count" />

  </el-card>
</template>


<script setup lang="ts">
import BigNumber from 'bignumber.js';



const connection = useFoo();



const props = defineProps({
  senderAddress: {
    required: true,
    type: String,
  },
});

const senderAddress = ref(props.senderAddress);
const currentPage = ref(1);

const { data, error, status } = await useAsyncData(async () => {

  const val = senderAddress.value;
  if (!val) {
    throw new Error('[AccountBurnings.vue] senderAddress is undefined');
  }

  const pageSize = 5;
  const from = (currentPage.value - 1) * pageSize;

  const raw = await connection.value.api.Burn.getAll(pageSize, from, val);
  if (!raw.success) {
    throw new Error('asfd');
  }

  return {
    burnings: raw.burn,
    count: raw.count,
  };
}, {
  lazy: true,
  watch: [senderAddress, currentPage],
});


function formatAmount(row: any, column: any) {
  return new BigNumber(row.amount).dividedBy(1e8).toFixed() + ' GNY';
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

.center-horizontally {
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
}
</style>
