<template>
    <div class="h-screen">
        <div v-if="loading" class="fixed left-0 top-0 h-0.5 w-full z-50 bg-green-500" />

    </div>
</template>

<script setup lang="ts">

const nuxtApp = useNuxtApp();
const loading = ref(false);

nuxtApp.hook("page:start", () => {
    loading.value = true;
});

nuxtApp.hook("page:finish", () => {
    loading.value = false;
});

</script>
