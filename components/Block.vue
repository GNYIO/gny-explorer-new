<template>
  <el-card>
    <h4 class="card-title">
      Blocks
    </h4>

    <el-table @row-click="blockRowClick" :data="blocks" stripe v-loading="blocksLoading">
      <el-table-column prop="height" align="center" label="Height" width="auto">
        <template #default="scope">
          <!-- :formatter="subID" -->
          <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
            {{ scope.row.height }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 500" prop="id" align="center" label="Block ID" width="auto">
        <template #default="scope">
          <!-- :formatter="subID" -->
          <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: scope.row.height } }">
            {{ scope.row.id.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto"
        :formatter="timestamp2date"></el-table-column>
      <el-table-column prop="delegate" align="center" label="Delegate" :formatter="subDelegate">
        <template #default="scope">
          <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { publicKey: scope.row.delegate } }">
            {{ scope.row.delegate.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <nuxt-link to="blocks">
      Explore more Blocks →
    </nuxt-link>
  </el-card>
</template>

<script setup lang="ts">

defineProps(['blocks', 'blocksLoading']);

import moment from 'moment';
import { slots } from '@gnyio/utils';
import type { TableColumnCtx } from 'element-plus';
import type { IBlock } from '@gnyio/interfaces';


async function blockRowClick(row: any, column: any, event: Event) {
  // https://nuxt.com/docs/api/utils/navigate-to
  // await navigateTo({
  //     path: '/block-detail',
  //     query: {
  //         height: row.height,
  //     }
  // });
}

function subId(row: IBlock, column: TableColumnCtx<IBlock>) {
  return row.id.slice(0, 8);
}

function subDelegate(row: IBlock, column: TableColumnCtx<IBlock>) {
  return row.delegate.slice(0, 8);
}

function timestamp2date(row: IBlock, column: TableColumnCtx<IBlock>) {
  return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

const width = 600;

</script>

<style scoped>
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