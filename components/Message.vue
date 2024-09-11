<template>
    <div class="mb-4">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <div class="p-4 border-b border-gray-200">
                <div class="text-sm text-gray-600">{{ formatDate(post.date) }}</div>
                <div class="text-sm text-gray-500">Channel: {{ post.channel }}</div>
            </div>
            <div class="p-4">
                <p class="text-gray-800" v-html="mdToHtml(post.text)" :original-text="post.text"></p>
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                <span>Views: {{ post.views }}</span>
                <span>Replies: {{ post.replies.length }}</span>
                <span>Reactions: {{ post.reactions.length }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { humanReadableDateDiff } from '~/utils/misc';

export default {
    name: 'Message',
    props: {
        post: {
            type: {
                id: String,
                text: String,
                channel: String,
                date: Date,
                editDate: Date,
                reactions: Array,
                replies: Array,
                views: Number,
            },
            required: true,
            default: () => {}
        }
    },
    methods: {
        formatDate(date: number): string {
            return humanReadableDateDiff(new Date(date * 1000));
        },
        mdToHtml(text: string): string {
            // convert **text** to <b>text</b>
            text = text.replace(/\*\*(.*?)\*\*/g, '<b class="text-blue-600">$1</b>');
            // convert hashtags to bold spans
            text = text.replace(/#[a-zA-Z0-9_]+/g, '<b>$&</b>');
            return text;
        }
    }
};
</script>

<style scoped>
/* Additional scoped styles if needed */
</style>
