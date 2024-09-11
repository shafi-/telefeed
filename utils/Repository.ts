export abstract class Repository<TInput, TOutput> {
    protected persistanceService: IndexedDbService<TInput>;

    constructor(persistanceService: IndexedDbService<TInput>) {
        this.persistanceService = persistanceService;
    }

    abstract create(item: TInput): Promise<void>;

    abstract update(item: TInput): Promise<void>;

    abstract delete(id: string): Promise<void>;

    abstract getById(id: string): Promise<TOutput|null>;

    abstract getAll(): Promise<TOutput[]>;
}

import type { Dialog } from 'telegram/tl/custom/dialog';
import { IndexedDbService } from './PersistanceService';
import bigInt from "big-integer";
import type { Entity } from 'telegram/define';
import type { Api } from 'telegram';

export class PostRepository extends Repository<Post, Post> {
    constructor() {
        super(new IndexedDbService('posts'));
    }

    async create(post: Post): Promise<void> {
        await this.persistanceService.setItem(post.id, post);
    }

    async update(post: Post): Promise<void> {
        await this.persistanceService.setItem(post.id, post);
    }

    async delete(id: string): Promise<void> {
        return this.persistanceService.removeItem(id);
    }

    async getById(id: string): Promise<Post | null> {
        return this.persistanceService.getItem(id);
    }

    async getAll(): Promise<Post[]> {
        return this.persistanceService.getAll();
    }
}

export interface Post {
    id: string;
    text: string;
    channelId: string;
    date: number;
    media?: Media;
}

export interface Media {
    type: 'photo' | 'video';
    url: string;
}

export interface Channel {
    id?: bigInt.BigInteger;
    name: string;
    channelId: string;
    date: number;
    isSelected: boolean;
    pinned: boolean;
    folderId?: number;
    archived: boolean;
    message?: Api.Message;
    entity?: Entity;
    inputEntity: Api.TypeInputPeer;
    title?: string;
    isUser: boolean;
    isGroup: boolean;
    isChannel: boolean;
}
// type Channel = Dialog & { channelId: string, isSelected?: boolean };

function mapDialogToChannel(dialog: Dialog): Channel {
    return {
        id: dialog.id,
        name: dialog.title || '',
        title: dialog.title || '',
        channelId: dialog.id?.toString() || '',
        date: dialog.date || 0,
        isSelected: false,
        pinned: dialog.pinned,
        folderId: dialog.folderId,
        archived: dialog.archived,
        entity: dialog.entity,
        inputEntity: dialog.inputEntity,
        isUser: dialog.isUser,
        isGroup: dialog.isGroup,
        isChannel: dialog.isChannel,
    };
}

function mapChannelToDialog(channel: Channel): Dialog & { isSelected: boolean} {
    return {
        id: channel.id,
        name: channel.name,
        title: channel.name,
        date: channel.date,
        pinned: channel.pinned,
        folderId: channel.folderId,
        archived: channel.archived,
        entity: channel.entity,
        inputEntity: channel.inputEntity,
        isUser: channel.isUser,
        isGroup: channel.isGroup,
        isChannel: channel.isChannel,
        isSelected: channel.isSelected,
    } as unknown as Dialog & { isSelected: boolean};
}

export class ChannelRepository extends Repository<Channel, Dialog> {
    async createAll(allChannels: Dialog[]) {
        await Promise.all(allChannels.map((channel) => {
            const item = mapDialogToChannel(channel);
            return this.create(item);
        }));
    }

    create(item: Channel): Promise<void> {
        return this.persistanceService.setItem(item.channelId, item);
    }

    async updateChannelSelection(channelId: string, isSelected: boolean): Promise<void> {
        const dialog = await this.getById(channelId);
        if (!dialog) {
            throw new Error('Channel not found');
        }
        const channel = mapDialogToChannel(dialog);
        channel.isSelected = isSelected;
        return this.persistanceService.setItem(channelId, channel);
    }

    update(item: Channel): Promise<void> {
        return this.persistanceService.setItem(item.channelId, item);
    }

    delete(channelId: string): Promise<void> {
        return this.persistanceService.removeItem(channelId);
    }

    getById(channelId: string): Promise<Dialog | null> {
        return this.persistanceService.getItem(channelId).then(mapChannelToDialog);
    }

    async getAll(): Promise<(Dialog &{ isSelected: boolean})[]> {
        const allChannels = await this.persistanceService.getAll();
        return allChannels.map(mapChannelToDialog);
    }

    constructor() {
        super(new IndexedDbService<Channel>('channels'));
    }
}
