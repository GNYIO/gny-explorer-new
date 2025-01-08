<template>
  <el-card>
    <h4 class="card-title">
      Basic
    </h4>

    <div class="wrapper">
      <div>
        Blocks
        <br v-if="blocksCount === ''">
        <i v-if="blocksCount === ''" class="el-icon-loading"></i>
        <p v-if="blocksCount">{{ blocksCount }}</p>
      </div>
      <div>
        Transactions
        <br v-if="transactions === ''">
        <i v-if="transactions === ''" class="el-icon-loading"></i>
        <p v-if="transactions">{{ transactions }}</p>
      </div>
      <div>
        Delegates
        <br v-if="data.delegates === ''">
        <i v-if="data.delegates === ''" class="el-icon-loading"></i>
        <p v-if="data.delegates">{{ data.delegates }}</p>
      </div>
      <div>
        Accounts
        <br v-if="data.accounts === ''">
        <i v-if="data.accounts === ''" class="el-icon-loading"></i>
        <p v-if="data.accounts">{{ data.accounts }}</p>
      </div>
      <div>
        Latest block height
        <br v-if="latestHeight === ''">
        <i v-if="latestHeight === ''" class="el-icon-loading"></i>
        <p v-if="latestHeight">{{ latestHeight }}</p>
      </div>
      <div>
        Current Supply
        <br v-if="data.supply === ''">
        <i v-if="data.supply === ''" class="el-icon-loading"></i>
        <p v-if="data.supply">{{ data.supply }} GNY</p>
      </div>
      <div>
        Burned Supply
        <br v-if="data.burned === ''">
        <i v-if="data.burned === ''" class="el-icon-loading"></i>
        <p v-if="data.burned">{{ data.burned }} GNY</p>
      </div>
    </div>
  </el-card>
</template>



<script setup>
import BigNumber from 'bignumber.js';

defineProps(['blocksCount', 'transactions', 'latestHeight'])

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

  const delegatesRaw = await connection.value.api.Delegate.getDelegates()
  if (!delegatesRaw.success) {
    throw new Error('failed to fetch delegates totalCount');
  }
  const delegates = delegatesRaw.totalCount;


  const accountsRaw = await connection.value.api.Account.countAccounts();
  if (!accountsRaw.success) {
    throw new Error('failed to fetch account count');
  }
  const accounts = accountsRaw.count;


  const rawSupply = await connection.value.api.Block.getSupply();
  if (!rawSupply.success) {
    throw new Error('failed to fetch supply');
  }

  const supply = rawSupply.supply === String(0) ? String(0) : new BigNumber(rawSupply.supply).dividedBy(1e8).toFixed(0);
  const burned = rawSupply.burned === String(0) ? String(0) : new BigNumber(rawSupply.burned).dividedBy(1e8).toFixed(0);

  return {
    delegates,
    accounts,
    supply,
    burned,
  };
});

</script>

<style scoped>
p {
  color: #acacac;
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

.card-body {
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.25rem;
}

.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 0;
}
</style>