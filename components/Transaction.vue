<template>
  <el-card class="startpage-item">
    <h4 class="card-title">
      Latest Transactions
    </h4>

    <el-table @row-click="transactionRowClick" :data="latestTransactions" stripe v-loading="transLoading">
      <el-table-column prop="id" align="center" label="TX ID" width="auto">
        <template #default="scope">
          <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: scope.row.id } }">
            {{ scope.row.id.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="height" align="center" label="Height" width="auto">
        <template #default="scope">
          <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
            {{ scope.row.height }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto"
        :formatter="timestamp2date"></el-table-column>
      <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto"
        :formatter="subSenderId">
        <template #default="scope">
          <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: scope.row.senderId } }">
            <div>{{ scope.row.senderId.slice(0, 8) }}</div>
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <nuxt-link to="transactions">
      Explore more Transactions →
    </nuxt-link>
  </el-card>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import type { TableColumnCtx } from 'element-plus';
import type { ITransaction } from '@gnyio/interfaces';

defineProps(['latestTransactions', 'transLoading']);


async function transactionRowClick(row: any, column: any, event: Event) {
  await navigateTo({
    path: '/transaction-detail',
    query: {
      id: row.id,
    }
  });
}


function subSenderId(row: ITransaction, column: TableColumnCtx<ITransaction>) {
  return row.senderId.slice(0, 8);
}

function timestamp2date(row: ITransaction, column: TableColumnCtx<ITransaction>) {
  return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

const width = 600;

</script>

<style scoped>

.startpage-item {
  margin-bottom: 30px;
}

.nuxt-link {
  color: #2475ba;
  cursor: pointer;
}

.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 0;
}
</style>