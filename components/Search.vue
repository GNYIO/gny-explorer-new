<template>
    <div>
        <!--
            change event listener:
            triggers when the input box loses focus or the user presses Enter, only if the modelValue has changed
            https://element-plus.org/en-US/component/input.html#input
        -->
        <el-input v-model="myInput" placeholder="Search...">
            <template #append>
                <el-button @click="search" :icon="Search" />
            </template>
        </el-input>
    </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { search as searchHelper } from '~/utils/search';


const connection = useFoo();
const myInput = ref('');

const dialog = useState('dialog');


async function search() {
    dialog.value = false;
    await searchHelper(myInput.value, connection);
    myInput.value = '';
}
</script>

<style scoped>
.el-input {
    width: 300px;
    margin-left: 0.3rem;
    margin-top: 0.5rem;
}
</style>
