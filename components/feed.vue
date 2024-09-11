<template>
  <div class="flex justify-center items-center bg-gray-100">
    <div class="flex">
      <div class="w-1/3 p-4 overflow-y-auto max-h-screen border-r border-gray-200">
        <h1 class="text-2xl font-bold pb-4">Channels <span class="text-gray-400">({{ channels.length }})</span></h1>
        <ul class="list-none">
          <li v-for="(channel, chIdx) in channels" :key="chIdx" @click="toggleChannelSelection(channel as Dialog)"
            :class="{ 'bg-gray-400': isChannelSelected(channel as Dialog), 'hover:bg-gray-200': !isChannelSelected(channel as Dialog) }"
            class="p-2 cursor-pointer mb-1 rounded">{{ channel.title }}</li>
        </ul>
      </div>
      <div class="w-2/3">
        <div class="w-2/3 px-4">
          <h1 class="text-2xl font-bold pb-4">Telegram Feed
            <Icon @click="fetchPosts" name="mdi:refresh" />
          </h1>
          <div v-if="isLoading" class="text-gray-400">Loading...</div>
          <div class="max-h-[90vh] overflow-y-auto">
            <Message v-for="(post, postIdx) in posts" :key="postIdx" :post="post" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Dialog } from 'telegram/tl/custom/dialog';
import FeedService from '~/utils/FeedService';

interface LocalState {
  authenticated: boolean;
  posts: any[];
  feedService: FeedService;
  isLoading: boolean;
  channels: Dialog[];
  selectedChannels: Pick<Dialog, 'id' | 'title' | 'name' | 'inputEntity'>[];
}

export default {
  name: 'Feed',
  data(): LocalState {
    return {
      authenticated: false,
      isLoading: false,
      posts: [],
      feedService: new FeedService(),
      channels: [],
      selectedChannels: [],
    };
  },
  async created() {
    this.isLoading = true;
    try {
      await this.feedService.init();
      this.channels = await this.feedService.loadChannels();
      this.selectedChannels = this.feedService.feedChannels
        .map((ch) => this.channels.find((c) => c.id?.toString() === ch))
        .map((dialog) => ({ id: dialog!.id, title: dialog!.title, name: dialog!.name, inputEntity: dialog!.inputEntity }));
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    createViewableMessage(msgObj: any) {
      return {
        id: msgObj.id,
        type: msgObj.className,
        text: msgObj.text,
        channel: msgObj.channel,
        date: msgObj.date,
        editDate: msgObj.editDate,
        reactions: msgObj.reactions || [],
        replies: msgObj.replies || [],
        views: msgObj.views || 0,
        original: msgObj,
      }
    },
    async fetchPosts() {
      this.isLoading = true;
      const msgs = await this.feedService.loadInitialMessages();
      this.posts = msgs.map(this.createViewableMessage);
      this.isLoading = false;
    },
    formatDate(date: Date) {
      return humanReadableDateDiff(date);
    },
    toggleChannelSelection(channel: Dialog) {
      if (channel.id) {
        if (this.isChannelSelected(channel)) {
          this.selectedChannels = this.selectedChannels.filter((ch) => ch.id !== channel.id);
        } else {
          this.selectedChannels.push({ id: channel.id, title: channel.title, name: channel.name, inputEntity: channel.inputEntity });
        }
        this.feedService.feedChannels = this.selectedChannels
          .map(ch => ch.id)
          .map((chId) => chId?.toString() || '');
      }
    },
    isChannelSelected(channel: Dialog): boolean {
      return this.selectedChannels.some((ch) => ch.id === channel.id);
    }
  },
};
</script>

<style scoped>
.feed-container {
  height: 80vh;
  overflow-y: scroll;
}
</style>
