import { Api, TelegramClient } from 'telegram';
import type { EntityLike } from 'telegram/define';
import type { TotalList } from 'telegram/Helpers';
import { StoreSession, Session } from 'telegram/sessions';
import { Dialog } from 'telegram/tl/custom/dialog';
import CredentialManager from './credential';

export class TClient {
    static instance: TClient;

    private user: any;
    private channels: Dialog[] = [];
    private session: Session;

    client?: TelegramClient;

    private constructor (private apiId: number, private apiHash: string) {
        this.session = new StoreSession('telefeed');
    }

    static getClient(): TClient {
        if (!TClient.instance) {
            const apiId = CredentialManager.getAppId();
            const apiHash = CredentialManager.getAppSecret();

            if (!apiId || !apiHash) {
                throw new Error('Credentials not found');
            }

            TClient.instance = new TClient(apiId, apiHash);
        }

        return TClient.instance;
    }

    async init() {
        await this.session.load();

        if (!this.client) {
            this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
                connectionRetries: 5,
                // autoReconnect: true,
                // useWSS: true,
            });
        }

        await this.client.connect();
    }

    isConnected() {
        return Boolean(this.client?.connected);
    }

    async loginWithQrCode(apiId: number, apiHash: string, qrCodeCb: (value: string)=> void, isLoggedIn: (val: boolean) => void) {
        if (!this.client) {
            await this.init();
        }
        
        const isAlreadyLoggedIn = await this.client?.isUserAuthorized();
        console.log({ isAlreadyLoggedIn });

        if (isAlreadyLoggedIn) {
            return isLoggedIn(true);
        }

        this.user = await this.client?.signInUserWithQrCode({ apiId, apiHash },
            {
                onError: async function(p1: Error) {
                    console.log("error", p1);
                    isLoggedIn(false);
                    return true;
                },
                qrCode: async (code) => {
                    console.log("Convert the next string to a QR code and scan it");
                    console.log(
                        `tg://login?token=${code.token.toString("base64")}`
                    );
                    console.log(`Expires at ${code.expires}`);
                    qrCodeCb(`tg://login?token=${code.token.toString("base64")}`);
                },
                password: async (hint) => {
                    // password if needed
                    console.trace(hint);
                    return "1111";
                }
            }
        );
        this.saveSession();
        isLoggedIn(true);
        console.log("user is", this.user);
    }

    async getSubscribedChannels() {
        if (this.channels.length > 0) {
            return this.channels;
        }

        // await this.reconnectIfNeeded();

        const result = await this.client?.getDialogs() || [];

        this.channels = result.filter((dialog) => dialog.isChannel);
        
        return this.channels;
    }
    
    private async reconnectIfNeeded(): Promise<void> {
        if (!this.client) {
            await this.init();
        }
        if (this.client?.disconnected) {
            await this.client?.connect();
        }
    }

    async fetchMessages(channel: Dialog): Promise<TotalList<Api.Message>> {
        // await this.reconnectIfNeeded();

        const inputChannel = await this.client!.getInputEntity(channel as unknown as EntityLike);

        return this.client!.getMessages(inputChannel, { limit: 10 });
    }

    getUser() {
        return this.user;
    }

    saveSession() {
        this.session.save();
    }
    
    getSavedSession() {
        
    }

    async stop() {
        await this.client?.disconnect();
    }
}

