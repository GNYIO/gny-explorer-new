<template>
  <div>
    <el-card>
      <h4 class="card-title">
        {{ formatTitle }}
      </h4>

      <div class="wrapper">
        <div>
          Block height
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: data?.transaction.height } }">
              {{ data?.transaction.height }}
            </nuxt-link>
          </p>
        </div>
        <div>
          Confirmations
          <p>{{ data?.confirmation }}</p>
        </div>
        <div v-if="data?.transaction">
          Forged Time
          <p>{{ timestamp2date(data.transaction) }}</p>
        </div>
        <div>
          Fee
          <p>{{ BigNumber(data?.transaction.fee || '50000000').dividedBy(1e8).toFixed() }}</p>
        </div>
        <div>
          Transaction Type
          <p>{{ data?.transaction.type }}</p>
        </div>
        <div>
          Signature
          <p>{{ data?.transaction.signatures.slice(0, 24) }}

            <!-- svg of element-plus "CopyDocumnet" icon-->
            <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
            <svg @click="copySignature" class="copy-document" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024">
              <path fill="currentColor"
                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
              </path>
              <path fill="currentColor"
                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
              </path>
            </svg>
          </p>


        </div>

        <div>
          Transaction ID
          <p>{{ data?.transaction.id.slice(0, 24) }}
            <!-- svg of element-plus "CopyDocumnet" icon-->
            <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
            <svg @click="copyId" class="copy-document" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path fill="currentColor"
                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
              </path>
              <path fill="currentColor"
                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
              </path>
            </svg>


          </p>
        </div>

        <div>
          Sender ID
          <p>
            <nuxt-link class="nuxt-link"
              :to="{ name: 'account-detail', query: { address: data?.transaction.senderId } }">
              {{ data?.transaction.senderId.slice(0, 20) }}
            </nuxt-link>
          </p>
        </div>

        <div>
          Sender Public Key
          <p>{{ data?.transaction.senderPublicKey.slice(0, 24) }}
            <!-- svg of element-plus "CopyDocumnet" icon-->
            <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
            <svg @click="copySenderPublicKey" class="copy-document" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024">
              <path fill="currentColor"
                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
              </path>
              <path fill="currentColor"
                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
              </path>
            </svg>
          </p>
        </div>


        <div v-if="data?.transaction.secondSignature">
          Second Signature
          <p>{{ data.transaction.secondSignature.slice(0, 24) }}

            <!-- svg of element-plus "CopyDocumnet" icon-->
            <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
            <svg @click="copySecondSignature" class="copy-document" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024">
              <path fill="currentColor"
                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
              </path>
              <path fill="currentColor"
                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
              </path>
            </svg>

          </p>
        </div>

        <div v-if="data?.transaction.type === 0">
          Amount
          <p>{{ data.args[0] }}</p>
        </div>
        <div v-if="data?.transaction.type === 0">
          Recipient
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: data.args[1] } }">
              {{ data.args[1] }}
            </nuxt-link>
          </p>
        </div>

        <div v-if="data?.transaction.type === 1">
          Username
          <p>{{ data.args[1] }}</p>
        </div>

        <div v-if="data?.transaction.type === 2">
          Second Public Key
          <p>{{ data.args[1].truncate(0, 24) }}

            <!-- svg of element-plus "CopyDocumnet" icon-->
            <!-- got svg from https://element-plus.org/en-US/component/icon.html#icon-collection -->
            <svg @click="copySecondSenderPubilcKey" class="copy-document" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024">
              <path fill="currentColor"
                d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
              </path>
              <path fill="currentColor"
                d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
              </path>
            </svg>


          </p>
        </div>

        <div v-if="data?.transaction.type === 3">
          Lock Amount
          <p>{{ data?.args[1] }} GNY</p>
        </div>
        <div v-if="data?.transaction.type === 3">
          Lock Height
          <p>{{ data?.args[0] }}</p>
        </div>


        <div v-if="data?.transaction.type === 4 || data?.transaction.type === 5">
          Vote List
          <p>
            <nuxt-link v-for="vote in data.args[1].split(',')" class="nuxt-link" :key="vote"
              :to="{ name: 'account-detail', query: { username: vote } }">
              {{ vote }}
            </nuxt-link>
          </p>
        </div>

        <div v-if="data?.transaction.type === 20">
          Burned GNY
          <p>{{ data.args[0] }} GNY</p>
        </div>


        <!--transaction type 100 start-->
        <div v-if="data?.transaction.type === 100">
          Registered Asset Issuer
          <p>{{ data.args[0] }}</p>
        </div>
        <div v-if="data?.transaction.type === 100">
          Registered Asset Issuer Description
          <p>{{ data.args[1].slice(0, 50) }}</p>
        </div>
        <!--transaction type 100 start-->

        <!--transaction type 101 start-->
        <div v-if="data?.transaction.type === 101">
          Created Asset Name
          <p>{{ data.args[0] }}</p>
        </div>
        <div v-if="data?.transaction.type === 101">
          Created Asset Maximum
          <p>{{ data.args[2] }}</p>
        </div>
        <div v-if="data?.transaction.type === 101">
          Created Asset Precision
          <p>{{ data.args[3] }}</p>
        </div>
        <div v-if="data?.transaction.type === 101">
          Created Asset Description
          <p>{{ data.args[1].slice(0, 70) }}</p>
        </div>
        <!--transaction type 101 end-->


        <!--transaction type 102 start-->
        <div v-if="data?.transaction.type === 102">
          Minted Currency Amount
          <p>{{ data.args[1] }} {{ data.args[0] }}</p>
        </div>
        <!--transaction type 102 end-->

        <!--transaction type 103 start-->
        <div v-if="data?.transaction.type === 103">
          Asset Transfer Amount
          <p>{{ data.args[1] }} {{ data.args[0] }}</p>
        </div>
        <div v-if="data?.transaction.type === 103">
          Recipient ID
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: data.args[2] } }">
              {{ data.args[2].slice(0, 20) }}
            </nuxt-link>
          </p>
        </div>
        <!--transaction type 103 end-->


        <div v-if="data?.transaction.message">
          Message
          <el-tooltip class="item" effect="light" :content="data.transaction.message" placement="bottom">
            <p>{{ data.transaction.message.slice(0, 25) }}</p>
          </el-tooltip>
        </div>

      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { isAddress, slots } from '@gnyio/utils';
import BigNumber from 'bignumber.js';
import type { ITransaction } from '@gnyio/interfaces';
import type { TableColumnCtx } from 'element-plus';


const connection = useFoo();

const route = useRoute();
const routeQuery = computed(() => route.query)

const { data, error, status } = await useAsyncData(async () => {

  const queryParams = routeQuery.value;
  console.log(`[transaction-detail] reactive query: ${JSON.stringify(queryParams, null, 2)}`);

  const id = queryParams['id'];

  if (typeof id !== 'string') {
    throw new Error('id query parameter not defined');
  }

  const query = {
    id: id,
  };

  const transactionRaw = await connection.value.api.Transaction.getTransactions(query);
  if (!transactionRaw.success) {
    throw new Error(' ');
  }
  const transaction: ITransaction = (transactionRaw.transactions as unknown as ITransaction[])[0];

  // this.date = moment.utc(slots.getRealTime(this.transaction.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
  // this.args = JSON.parse(this.transaction.args);
  // this.message = this.transaction.message;
  // this.transaction.fee = new BigNumber(this.transaction.fee).dividedBy(1e8).toFixed();

  const currentHeightRaw = await connection.value.api.Block.getHeight();
  if (!currentHeightRaw.success) {
    throw new Error('failed to fetch latest height');
  }
  const height = currentHeightRaw.height;


  const confirmation = new BigNumber(height).minus(transaction.height).toFixed();

  const args = JSON.parse(transaction.args);


  switch (transaction.type) {
    case 0:
      args[0] = new BigNumber(args[0]).dividedBy(1e8).toFixed();
      // is recipient of type address?
      if (!isAddress(args[1])) {
        const reciepintRaw = await connection.value.api.Account.getAccountByUsername(args[1]);
        if (!reciepintRaw.success) {
          throw new Error('failed to fetch recipient');
        }

        args[1] = reciepintRaw.address;
      }
      break;
    case 1:
      // args[0] holds username
      break;
    case 2:
      // args[0] holds secondPublicKey
      break;
    case 3:
      args[0] = new BigNumber(args[0]).toFixed(); // lockHeight
      args[1] = new BigNumber(args[1]).dividedBy(1e8).toFixed(); // amount
      break;
    case 4:
    case 5:
      // args[0] holds voteList
      break;
    case 20:
      // args[0] holds burnedGNY
      args[0] = new BigNumber(args[0]).dividedBy(1e8).toFixed();
      break;
    case 100:
      // args[0] holds username of asset issuer
      // args[1] holds desc of asset issuer
      break;
    case 101:
      // args[0] holds asset name
      // args[1] holds description asset
      args[2] = new BigNumber(args[2]).dividedBy(1e8).toFixed(); // asset maximum
      // args[3] holds asset precision
      break;
    case 102:
      // args[0] holds currency
      // args[1] holds amount
      break;
    case 103:
      // currency, amount, recipient
      // args[0] holds currency
      // args[1] holds amount
      // args[2] holds recipient

      if (!isAddress(args[1])) {
        const accountRaw = await connection.value.api.Account.getAccountByAddress(args[1]);
        if (!accountRaw.success) {
          throw new Error('');
        }
        args[1] = accountRaw.address;
      }

      const precisionRaw = await connection.value.api.Uia.getAsset(args[0]);
      if (!precisionRaw.success) {
        throw new Error('could not fetch asset');
      }

      const precision = Math.pow(10, precisionRaw.asset.precision);
      args[1] = new BigNumber(args[1]).dividedBy(precision).toFixed();
      break;
  }


  return {
    transaction,
    confirmation,

    args, // parsed data in args arrayx
  }
}, {
  lazy: true,
  watch: [routeQuery],
});


const formatTitle = computed(() => {

  if (data.value?.transaction && data.value.transaction.type === 0) {
    return 'Transaction - GNY Transfer';
  }
  if (data.value?.transaction && data.value.transaction.type === 1) {
    return 'Transaction - Set Username';
  }
  if (data.value?.transaction && data.value.transaction.type === 2) {
    return 'Transaction - Set Second Password';
  }
  if (data.value?.transaction && data.value.transaction.type === 3) {
    return 'Transaction - Lock GNY';
  }
  if (data.value?.transaction && data.value.transaction.type === 4) {
    return 'Transaction - Vote for Delegate';
  }
  if (data.value?.transaction && data.value.transaction.type === 5) {
    return 'Transaction - Unvote Delegate';
  }
  if (data.value?.transaction && data.value.transaction.type === 6) {
    return 'Transaction - Unlock GNY';
  }
  if (data.value?.transaction && data.value.transaction.type === 10) {
    return 'Transaction - Register Delegate';
  }
  if (data.value?.transaction && data.value.transaction.type === 20) {
    return 'Transaction - Burn GNY';
  }

  if (data.value?.transaction && data.value.transaction.type === 100) {
    return 'Transaction - Register Asset Issuer';
  }
  if (data.value?.transaction && data.value.transaction.type === 101) {
    return 'Transaction - Register Asset';
  }
  if (data.value?.transaction && data.value.transaction.type === 102) {
    return 'Transaction - Mint Asset';
  }
  if (data.value?.transaction && data.value.transaction.type === 103) {
    return 'Transaction - Transfer Asset';
  }

  // fallback
  return 'Custom Transaction Name';
});



const { isSupported, copy } = useClipboard();

async function copyId() {
  if (!isSupported) {
    console.log('copying to clipboard is ont supported');
    return;
  }
  const result = data.value?.transaction.id || '';
  await copy(result);
}


async function copySignature() {
  if (!isSupported) {
    console.log('copying to clipboard is ont supported');
    return;
  }
  const result = data.value?.transaction.signatures || '';
  await copy(result);
}

async function copySecondSignature() {
  if (!isSupported) {
    console.log('copying to clipboard is ont supported');
    return;
  }
  const result = data.value?.transaction.secondSignature || '';
  await copy(result);
}

async function copySenderPublicKey() {
  if (!isSupported) {
    console.log('copying to clipboard is ont supported');
    return;
  }
  const result = data.value?.transaction.senderPublicKey || '';
  await copy(result);

}

async function copySecondSenderPubilcKey() {
  if (!isSupported) {
    console.log('copying to clipboard is ont supported');
    return;
  }
  const result = data.value?.args[0] || '';
  await copy(result);
}

function timestamp2date(row: ITransaction) {
  return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
}

</script>


<style scoped>
i {
  cursor: pointer;
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

.copy-document {
    width: 20px;
}

.copy-document:hover {
    cursor: pointer;
}

.copy-document:hover path {
    fill: #565656;
}

.copy-document:active path {
    fill: #000;
}

</style>