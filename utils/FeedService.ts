import { TClient } from './TClient';
import type { Dialog } from 'telegram/tl/custom/dialog';
import type { TotalList } from 'telegram/Helpers';
import type { Api } from 'telegram';
import { chunk } from '~/utils/misc';
import type { PersistanceService } from '~/utils/PersistanceService';
import { ChannelRepository } from '#imports';

const exampleMsg = {
  "out": false,
  "mentioned": false,
  "mediaUnread": false,
  "silent": false,
  "post": true,
  "fromScheduled": false,
  "legacy": false,
  "editHide": false,
  "pinned": false,
  "noforwards": false,
  "invertMedia": false,
  "flags2": 0,
  "offline": false,
  "id": 4652,
  "fromId": null,
  "fromBoostsApplied": null,
  "peerId": {
      "channelId": "1389553708",
      "className": "PeerChannel"
  },
  "savedPeerId": null,
  "fwdFrom": null,
  "viaBotId": null,
  "viaBusinessBotId": null,
  "replyTo": null,
  "date": 1725645427,
  "message": "06 Sep 2024 জুমার বয়ান।\n\nবয়ান করেন,\n\n\n🌷🌹হযরত মাওলানা মুফতী \n     মুহাম্মদ ইয়াহইয়া সাহেব\n       দামাত বারাকাতুহুম🌹🌷\n       \nবায়তুল জান্নাত মোল্লা কেন্দ্রীয় জামে মসজিদ, মিরপুর১২,\nপল্লবী, ঢাকা১২১৬।\n\n\n\n\nআমাদের চ্যানেল লিংক\nHttps://t.me/boyan24\n\nHelp:- 01930801528 মামুন",
  "media": {
      "flags": 1,
      "nopremium": false,
      "spoiler": false,
      "video": false,
      "round": false,
      "voice": false,
      "document": {
          "flags": 0,
          "id": "6257975712020435542",
          "accessHash": "6099004852750577824",
          "fileReference": {
              "type": "Buffer",
              "data": [
                  2,
                  82,
                  210,
                  232,
                  44,
                  0,
                  0,
                  18,
                  44,
                  102,
                  220,
                  135,
                  37,
                  226,
                  252,
                  155,
                  65,
                  169,
                  19,
                  145,
                  180,
                  87,
                  11,
                  17,
                  47,
                  139,
                  214,
                  132,
                  49
              ]
          },
          "date": 1725645427,
          "mimeType": "audio/mpeg",
          "size": "10354892",
          "thumbs": null,
          "videoThumbs": null,
          "dcId": 5,
          "attributes": [
              {
                  "flags": 3,
                  "voice": false,
                  "duration": 1294,
                  "title": "🕋  জুমার বয়ান 🕋",
                  "performer": "মুফতী মুহাম্মদ ইয়াহইয়া সাহেব দামাত বারাকাতুহুম,",
                  "waveform": null,
                  "className": "DocumentAttributeAudio"
              },
              {
                  "fileName": "06_Sep_2024_জুমার_বয়ান।_বয়ান_করেন,_হযরত_মাওলানা_মুফতী_মুহাম্মদ.mp3",
                  "className": "DocumentAttributeFilename"
              }
          ],
          "className": "Document"
      },
      "altDocument": null,
      "ttlSeconds": null,
      "className": "MessageMediaDocument"
  },
  "replyMarkup": null,
  "entities": [
      {
          "offset": 69,
          "length": 25,
          "className": "MessageEntityBold"
      },
      {
          "offset": 208,
          "length": 20,
          "className": "MessageEntityBold"
      },
      {
          "offset": 228,
          "length": 20,
          "className": "MessageEntityUrl"
      },
      {
          "offset": 250,
          "length": 7,
          "className": "MessageEntityBold"
      },
      {
          "offset": 257,
          "length": 11,
          "className": "MessageEntityPhone"
      },
      {
          "offset": 268,
          "length": 6,
          "className": "MessageEntityBold"
      }
  ],
  "views": 518,
  "forwards": 2,
  "replies": {
      "flags": 1,
      "comments": true,
      "replies": 0,
      "repliesPts": 16458,
      "recentRepliers": null,
      "channelId": "1721018835",
      "maxId": null,
      "readMaxId": null,
      "className": "MessageReplies"
  },
  "editDate": 1725664365,
  "postAuthor": "মোঃ মামুন",
  "groupedId": null,
  "reactions": {
      "flags": 0,
      "min": false,
      "canSeeList": false,
      "reactionsAsTags": false,
      "results": [
          {
              "flags": 0,
              "chosenOrder": null,
              "reaction": {
                  "emoticon": "❤",
                  "className": "ReactionEmoji"
              },
              "count": 7,
              "className": "ReactionCount"
          },
          {
              "flags": 0,
              "chosenOrder": null,
              "reaction": {
                  "emoticon": "👍",
                  "className": "ReactionEmoji"
              },
              "count": 1,
              "className": "ReactionCount"
          }
      ],
      "recentReactions": null,
      "className": "MessageReactions"
  },
  "restrictionReason": null,
  "ttlPeriod": null,
  "quickReplyShortcutId": null,
  "effect": null,
  "factcheck": null,
  "className": "Message"
}

export default class FeedService {
    private now: Date;
    private currentMinDate: Date;
    private messages: any[];
    private tgClient: TClient;
    private allChannels?: Dialog[];
    private _feedChannels: string[] = [];
    private channelRepo: ChannelRepository;

    constructor(private timePeriodInMinutes = 60) {
      this.now = new Date();
      this.currentMinDate = new Date(this.now.getTime() - timePeriodInMinutes * 60 * 1000);
      this.messages = [];
      this.tgClient = TClient.getClient();
      this.channelRepo = new ChannelRepository();
    }

    async init() {
      if (!this.tgClient) this.tgClient = TClient.getClient();
      await this.tgClient.init();
    }

    async loadInitialMessages(): Promise<any[]> {
      this.messages = [];
      return this.loadMoreMessages();
    }
  
    async loadChannels(): Promise<Dialog[]> {
      const channels = await this.channelRepo.getAll();
      if (channels.length > 0) {
        this.feedChannels = channels.filter((channel) => channel.isSelected).map((channel) => channel.id!.toString());
        this.allChannels = channels;
        return this.allChannels;
      }

      if (!this.tgClient) this.tgClient = TClient.getClient();
      this.allChannels = await this.tgClient.getSubscribedChannels();
      await this.channelRepo.createAll(this.allChannels);

      return this.allChannels;
    }

    set feedChannels(channelIds: string[]) {
      this._feedChannels = channelIds;
      Promise.all(channelIds.map((channelId) => this.channelRepo.updateChannelSelection(channelId, true)));
    }

    get feedChannels(): string[] {
      return this._feedChannels;
    }

    addMessages(newMessages: TotalList<Api.Message>, channelEntity: any) {
      console.log({ newMessages, channelEntity });

      if (!Array.isArray(newMessages)) {
        newMessages = [newMessages];
      }

      newMessages.forEach((msg: any) => {
        if (msg.message) {
          this.messages.push(this.createPost(msg, channelEntity));
        }
      });
    }
  
    private createPost(msgObj: any, channelEntity: any) {
      return {
        id: msgObj.id,
        type: msgObj.className,
        text: msgObj.text,
        channel: channelEntity.title || channelEntity.name,
        date: msgObj.date,
        editDate: msgObj.editDate,
        reactions: msgObj.reactions || [],
        replies: msgObj.replies || [],
        views: msgObj.views || 0,
        original: msgObj,
      };
    }

    sortMessages() {
      this.messages.sort((a, b) => b.date - a.date);
    }
  
    async loadMoreMessages(): Promise<any[]> {
      this.currentMinDate = new Date(this.currentMinDate.getTime() - 30 * 60 * 1000);

      if (!this.allChannels) {
        this.allChannels = await this.tgClient.getSubscribedChannels();
      }

      await Promise.allSettled(
        chunk(this.getChannelsForMessage(), 5)
          .map(async (channelChunk: any[]) => {
            await Promise.all(
              channelChunk.map(async (channel: any) => {
                this.addMessages(await this.tgClient.fetchMessages(channel), channel);
              })
            );
          })
        );

      this.sortMessages();

      return this.messages;
    }
    
    getChannelsForMessage(): any[] {
      if (this.feedChannels.length > 0) {
        return this.allChannels?.filter((channel) => this.feedChannels.includes(channel.id!.toString())) || [];
      }

      return this.allChannels?.slice(0, 10) || [];
    }
}
