<template>
    <div class="max-w-4xl mx-auto p-4">
        <messages v-for="message in messages" :post="message" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
    {
        id: '1',
        text: 'This is a message',
        channel: 'John Doe',
        date: new Date(),
        editDate: new Date(Date.now() - 1000 * 60 * 5),
        reactions: [],
        replies: [],
        views: 12,
    },
    {
        id: '2',
        text: 'This is another message',
        channel: 'Jane Doe',
        date: new Date(),
        editDate: null,
        reactions: [],
        replies: [],
        views: 5,
    },
]);

</script>

<style scoped></style>
