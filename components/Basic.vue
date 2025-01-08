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
        <br v-if="dalegates === ''">
        <i v-if="dalegates === ''" class="el-icon-loading"></i>
        <p v-if="dalegates">{{ dalegates }}</p>
      </div>
      <div>
        Accounts
        <br v-if="accounts === ''">
        <i v-if="accounts === ''" class="el-icon-loading"></i>
        <p v-if="accounts">{{ accounts }}</p>
      </div>
      <div>
        Latest block height
        <br v-if="latestHeight === ''">
        <i v-if="latestHeight === ''" class="el-icon-loading"></i>
        <p v-if="latestHeight">{{ latestHeight }}</p>
      </div>
      <div>
        Current Supply
        <br v-if="supply === ''">
        <i v-if="supply === ''" class="el-icon-loading"></i>
        <p v-if="supply">{{ supply }} GNY</p>
      </div>
      <div>
        Burned Supply
        <br v-if="burned === ''">
        <i v-if="burned === ''" class="el-icon-loading"></i>
        <p v-if="burned">{{ burned }} GNY</p>
      </div>
    </div>
  </el-card>
</template>



<script setup>

defineProps(['blocksCount', 'transactions', 'latestHeight'])

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