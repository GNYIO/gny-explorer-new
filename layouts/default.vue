<template>
    <el-container>
        <el-row class="nerwork-header">
            <el-col><span class="current_network">{{ network.toUpperCase() }}</span></el-col>
        </el-row>

        <el-row :gutter="24">
            <el-col :span="2">
                <nuxt-link to="/">
                    <img src="~/assets/logo.png" alt="logo" class="logo">
                </nuxt-link>
            </el-col>
            <el-col :span="20">
            </el-col>
            <el-col :span="2">
                <el-button :icon="Grid" @click="dialogVisible = !dialogVisible" circle size="large" />
            </el-col>
        </el-row>


        <el-dialog v-model="dialogVisible" :fullscreen="width < 500" top="40vh" width="70%">
            <template #header>
                <img src="~/assets/logo.png" alt="logo" class="logo">
            </template>

            <template #default>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/blocks" class="second-link">Blocks</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/transactions" class="second-link">Transactions</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/delegates" class="second-link">Delegates</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/assets" class="second-link">Assets</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/burnings" class="second-link">Burnings</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/dats" class="second-link">Dats</nuxt-link>
                <nuxt-link @click="dialogVisible = !dialogVisible" to="/peers" class="second-link">Peers</nuxt-link>

                <!-- <Search /> -->

            </template>
        </el-dialog>


        <el-alert title="Network is down." type="warning" v-if="error" show-icon>
        </el-alert>
        <el-main>
            <NuxtPage />
        </el-main>
        <el-footer>
            © 2025 by gny.io Limited
        </el-footer>
    </el-container>
</template>

<script setup lang="ts">
const config = useConfig();
const network = ref(config.value.network);
import { Grid } from '@element-plus/icons-vue'


const dialogVisible = ref(false);

const connection = useFoo();

const { data, error, status } = await useAsyncData(async () => {
    const raw = await connection.value.api.Block.getHeight();
    if (!raw.success) {
        throw new Error('fetched height');
    }

    return {
        height: raw.height,
    };
}, {
    lazy: true,
});


const { width } = useWindowSize();

</script>

<style>
body {
    font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
}

.card-title {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
}

.el-main {
    padding: 0.5rem 0.5rem;
    margin-top: 1rem;
}

@media screen and (min-width: 600px) {
    .el-main {
        padding: 1rem 1rem;
    }
}

@media screen and (min-wdith: 800px) {
    .el-main {
        padding: 2rem 2rem;
    }
}


a {
    text-decoration: none;
}

@media (max-width: 999px) {
    #nav_collapse {
        background-color: #F8F9FA;
    }
}

.header {
    z-index: 999;
    height: 50px;
    padding: 0;
}

.nerwork-header {
    z-index: 999;
    height: 20px;
}

/* .inner {
    max-width: 1000px;
    box-sizing: border-box;
    margin: 0px auto;
    padding: 5px 5px;
  } */

.second-link {
    margin-left: 7px;
    display: block;
    font-size: 20px;
    margin-top: 0.5rem;
}

.logo {
    width: 45px;
    display: inline-block;
    vertical-align: middle;
}

.el-alert {
    position: fixed;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
}

.el-footer {
    text-align: center;
    color: #acacac;
}

.current_network {
    float: right;
    padding-right: 1.2rem;
}
</style>
