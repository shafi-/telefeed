<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="w-full max-w-xs md:max-w-md lg:max-w-lg p-4">
            <div v-for="post in posts" :key="post.id" class="mb-4">
                <div class="bg-white shadow-md rounded-lg overflow-hidden">
                    <div class="p-4 border-b border-gray-200">
                        <div class="text-sm text-gray-600">{{ formatDate(post.date) }}</div>
                        <div class="text-sm text-gray-500">Channel: {{ post.channel }}</div>
                    </div>
                    <div class="p-4">
                        <p class="text-gray-800">{{ post.text }}</p>
                    </div>
                    <div class="p-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                        <span>Views: {{ post.views }}</span>
                        <span>Replies: {{ post.replies.length }}</span>
                        <span>Reactions: {{ post.reactions.length }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
class Post {
    id: string;
    text: string;
    channel: string;
    date: Date;
    editDate: Date;
    reactions: Array;
    replies: Array;
    views: number;
};

interface LocalState {
    posts: Array<Post>,
};

export default {
    data(): LocalState {
        return {
            posts: Array.from({ length: 100 }, (_, i) => ({
                id: String(i + 1),
                channel: `Post #${i + 1}`,
                text: `This is an example post #${i + 1}`,
                date: new Date(Date.now() - 1000 * 60 * 5 * i),
                editDate: new Date(Date.now() - 1000 * 60 * 5 * i),
                reactions: [],
                replies: [],
                views: i * 10,
            })),
        };
    },
    methods: {
        formatDate(date: Date) {
            return humanReadableDateDiff(date);
        }
    }
};
</script>

<style scoped>
/* You can add scoped styles here if needed */
</style>
