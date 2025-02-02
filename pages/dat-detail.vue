<template>
  <div>
    <el-card>
      <h4 class="card-title">
        {{ custom_title }}
      </h4>

      <div class="wrapper">
        <div v-if="data">
          DAT Name
          <p>
            {{ data.dat.name.slice(0, 18) }}
            <!-- <i class="el-icon-copy-document" @click="copyName"> -->
          </p>
        </div>
        <div v-if="data">
          Hash
          <p>
            {{ data.dat.hash.slice(0, 16) }}
            <!-- <i class="el-icon-copy-document" @click="copyHash"></i> -->
          </p>
        </div>

        <div v-if="data?.dat.previousHash">
          Previous Hash in chain
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: data.dat.previousHash } }">{{
              data.dat.previousHash.slice(0, 16)
              }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Previous Hash in chain
          <p>no previous hash</p>
        </div>

        <div v-if="data?.nextHash.hash">
          Next Hash in chain
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: data.nextHash.hash } }">{{ data.nextHash.hash.slice(0,
              16)
              }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Next Hash in chain
          <p>no next hash</p>
        </div>


        <div>
          DAT Maker
          <p v-if="data">
            <nuxt-link :to="{ name: 'dat-maker-detail', query: { makerId: data.dat.datMakerId } }">{{
              data.dat.datMakerId
              }}</nuxt-link>
          </p>
        </div>

        <!-- use v-if otherwise when loading one can see for a split second "undefined" -->
        <div v-if="data?.dat.counter">
          Chronological order position
          <p><strong>{{ data.dat.counter | ordinal }}</strong> DAT from <nuxt-link
              :to="{ name: 'dat-maker-detail', query: { makerId: data.dat.datMakerId } }">{{ data.dat.datMakerId
              }}</nuxt-link>
          </p>
        </div>

        <div>
          Owner Address
          <p v-if="data">
            <nuxt-link :to="{ name: 'account-detail', query: { address: data.dat.ownerAddress } }">{{
              data.dat.ownerAddress
              }}</nuxt-link>
          </p>
        </div>

        <div>
          Minting Transaction
          <p v-if="data">
            <nuxt-link :to="{ name: 'transaction-detail', query: { id: data.dat.tid } }">{{ data.dat.tid.slice(0, 16)
              }}</nuxt-link>
          </p>
        </div>

        <div>
          Time Minted
          <p>{{ timestamp2date(data?.dat.timestamp || 0) }}</p>
        </div>

        <div>
          DAT URL <span class="grayed_out">(at your own risk)</span>
          <p v-if="data">{{ data.dat.url.slice(0, 24) }}
            <!-- <i class="el-icon-copy-document" @click="copyDatUrl"></i> -->
          </p>
        </div>

        <div>
          <el-tooltip v-if="showError === false && showSuccess === false" effect="dark" placement="bottom">
            <div slot="content">Click to verify this DAT.<br /> Use at your own risk!</div>

            <!-- setting the "border-width" to "0px" fixes a bug where the border of the button overflows the el-loading-mask css class -->
            <el-button style="font-size: 53px; border-width: 0px;" @click="verify" type="warning"
              icon="el-icon-question" circle v-loading="buttonLoading"></el-button>
          </el-tooltip>

          <el-tooltip v-if="showError" effect="dark" placement="bottom">
            <div slot="content">{{ errorText }}</div>
            <el-button style="font-size: 53px;" v-if="showError === true" type="danger" icon="el-icon-close"
              circle></el-button>
          </el-tooltip>

          <el-tooltip v-if="showSuccess" effect="dark" placement="bottom">
            <div slot="content">{{ successText }}</div>

            <el-button style="font-size: 53px;" v-if="showSuccess === true" type="success" icon="el-icon-check"
              circle></el-button>
          </el-tooltip>
        </div>

      </div>
    </el-card>

    <el-card>
      <h4 class="card-title">
        DAT Chain
      </h4>


      <el-steps simple>

        <el-step v-for="row in rows" :status="typeof row.hash === 'string' ? 'success' : 'wait'" icon="el-icon-upload"
          v-bind:key="row.counter">
          <div slot="title">

            <span v-if="row.hash && row.current">
              <strong>DAT &#35;{{ row.counter }}</strong>
            </span>

            <nuxt-link v-if="row.hash && !row.current" :to="{ name: 'dat-detail', query: { hash: row.hash } }">DAT
              &#35;{{ row.counter }}</nuxt-link>

            <span v-if="!row.hash">not minted yet</span>

          </div>
        </el-step>

      </el-steps>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { slots } from '@gnyio/utils';
import axios from 'axios';
import * as webEd from '@gnyio/web-ed';


const custom_title: string = computed(() => {
  if (data && typeof data.dat.name === 'string') {
    const last = data.dat.name.split('.')[1];

    if (last.length > 20) {
      const lastShort = last.slice(0, 20) + '...';
      return `DAT ${lastShort}`;
    } else {
      return `DAT ${last}`
    }

  } else {
    return 'DAT Info';
  }
});


const route = useRoute();
const routeQuery = computed(() => route.query)

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {

  // showError: false,
  // errorText: '',

  // showSuccess: false,
  // successText: '',
  // buttonLoading: false,

  // dat: {},
  // datMaker: {},
  // nextHash: {},
  // rows: [],


  const query = routeQuery.value;
  console.log(`reactive query: ${JSON.stringify(query, null, 2)}`);

  const potentialHash = routeQuery.value['hash'];
  const potentialName = routeQuery.value['name'];

  // https://dushkin.tech/posts/js_assign_variable_in_switch/
  const dat = await (async function () {
    if (isString(potentialHash)) {
      const raw = await connection.value.api.Dat.getSingleDat({
        hash: potentialHash,
      });
      if (raw.success) {
        return raw.dat;
      }
    }

    if (isString(potentialName)) {
      const raw = await connection.value.api.Dat.getSingleDat({
        name: potentialName,
      });
      if (raw.success) {
        return raw.dat;
      }
    }

    throw new Error('failed to fetch either ')
  })();


  const rawMaker = await connection.api.Dat.getSingleDatMaker(dat.datMakerId);
  if (!rawMaker.success) {
    throw new Error('failed to fetch DATMaker of DAT');
  }


  // try to get next hash
  console.log(`counter: ${dat.counter}`);
  const nextHashRaw = await connection.api.Dat.getDats({
    maker: dat.datMakerId,
    limit: 1,
    offset: Number(dat.counter),
  });
  if (!nextHashRaw.success) {
    throw new Error('failed to fetch next DAT in line');
  }


  let nextHash = {};
  if (nextHashRaw.dats.length === 1) {
    nextHash = nextHashRaw.dats[0];
  }


  // add previous dat to rows
  const rows = [];
  if (typeof dat.previousHash === 'string') {
    rows.push({
      hash: dat.previousHash,
      counter: Number(dat.counter) - 1,
    });
  }

  // add current dat to rows
  rows.push({
    hash: dat.hash,
    counter: Number(dat.counter),
    current: true,
  });

  // add next or future dat to rows
  if (Object.keys(nextHash).length > 0) { // not an empty object
    rows.push({
      hash: nextHash.hash,
      counter: Number(nextHash.counter),
    });
  } else { // empty object
    rows.push({
      hash: undefined,
      counter: Number(dat.counter) + 1,
    });
  }

  return {
    dat,
    nextHash,
    rows,
  };

}, {
  lazy: true,
  watch: [routeQuery],
});


// for dats
const showError = ref(false);
const showSuccess = ref(false);
const buttonLoading = ref(false);


async function copyName() {
  try {
    await this.$copyText(this.dat.name);
  } catch (err) {
    console.error(e);
  }
}

async function copyHash() {
  try {
    await this.$copyText(this.dat.hash);
  } catch (err) {
    console.error(e);
  }
}

async function copyDatUrl() {
  try {
    await this.$copyText(this.dat.url);
  } catch (e) {
    console.error(e);
  }
}

async function verify() {
  this.buttonLoading = true;

  console.log('verifing DAT...');

  let result = null;
  try {
    console.log(`url: ${this.dat.url}`);

    result = await axios.request({
      method: 'GET',
      url: this.dat.url,
      maxRedirects: 0, // do not redirect
      // responseType: 'json',
      crossDomain: true,
      timeout: 5000,
    });
    console.log('finished request');
  } catch (err) {

    // error happens if domain does not exist or file can't be found
    console.log('error during fetching json data (dat-detail)');
    console.log(err);

    this.showError = true;
    this.errorText = 'File not found!';

    // todo: show Notification popup
    this.buttonLoading = false;
    return;
  }

  console.log('after try block');


  // validate structure of data
  const validationResult = gnyClient.schemas.datSchema.validate(result.data);
  if (!validationResult.result) {
    this.showError = true;
    this.errorText = 'Data is not in correct format';
    this.buttonLoading = false;
    return;
  }

  if (result.data.hash) { // is DATsha256
    const data = result.data.data;
    const hash = result.data.hash;

    const ownHash = webEd.createSha256Hash(data);
    if (hash !== ownHash) {
      this.showError = true;
      this.errorText = 'Data does not match the provided Hash!';
      this.buttonLoading = false;
      return;
    } else {
      this.showSuccess = true;
      this.successText = 'Hashes are matching! Data has not changed.';
      this.buttonLoading = false;
      return;
    }
  } else { // is DATEd25519
    const data = result.data.data;
    const publicKey = result.data.publicKey;
    const signature = result.data.signature;
    try {
      const result = gnyClient.verification.MessageWebBase.verify(
        data,
        signature,
        publicKey
      );
      if (result) {
        ths.showSuccess = true;
        this.successText = 'Signature is correct. Data wasn\'t tampered with';
        this.buttonLoading = false;
        return;
      } else {
        this.showError = true;
        this.errorText = 'ed25519 signature does not match';
        this.buttonLoading = false;
        return;
      }
    } catch (err) {
      this.showError = true;
      this.errorText = 'ed25519 not in correct format';
      this.buttonLoading = false;
      return;
    }
  }

}

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

.el-icon-copy-document {
  transition: 0.1s;
  transition-property: color;
}

.el-icon-copy-document:hover {
  color: #565656;
}

.el-icon-copy-document:active {
  color: black;
}

.grayed_out {
  color: #acacac;
  font-size: 12px;
  font-weight: 300;
}
</style>