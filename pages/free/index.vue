<template>
    <div>
        <div v-if="!saved">
            <h1>Setup Your Telegram App</h1>
            <form @submit.prevent="saveCredentials">
                <label for="apiId">API ID:</label>
                <input id="apiId" v-model="apiId" type="text" required>

                <label for="apiHash">API Hash:</label>
                <input id="apiHash" v-model="apiHash" type="text" required>

                <button type="submit">Save</button>
            </form>
        </div>

        <div v-if="shouldLogIn">
            <button @click="initLogin">Login</button>
            <qrcode v-if="showQRCode" :value="qrCodeValue" :size="300" level="H" />
        </div>

        <div v-if="canSeePosts">
            <Feed />
        </div>
    </div>
</template>

<script lang="ts">
interface LocalState {
    apiId?: number;
    apiHash: string;
    saved: Boolean;
    isLoggedIn: boolean;
    tClient?: TClient;
    qrCodeValue?: string;
    showQRCode: boolean;
}

import CredentialManager from '~/utils/credential';
import { TClient } from '~/utils/TClient';
import Qrcode from 'qrcode.vue';

export default {
    components: { Qrcode },
    data(): LocalState {
        return {
            apiId: undefined,
            apiHash: '',
            saved: false,
            isLoggedIn: false,
            tClient: undefined,
            qrCodeValue: undefined,
            showQRCode: false,
        };
    },
    created() {
        this.apiId = CredentialManager.getAppId();
        this.apiHash = CredentialManager.getAppSecret() || '';

        this.saved = Boolean(this.apiId && this.apiHash);

        if (this.saved) {
            this.initClient();
            this.initLogin();
        }
    },
    computed: {
        canSeePosts() {
            return this.isLoggedIn;
        },
        shouldLogIn() {
            return this.saved && !this.isLoggedIn;
        },
    },
    methods: {
        initClient() {
            const tClient = TClient.getClient();
            // @ts-ignore
            if (window) window.tClient = tClient;
            this.tClient = tClient;
        },

        async initLogin() {
            if (!this.tClient) {
                this.initClient();
            }

            try {
                await this.tClient?.loginWithQrCode(
                    Number(this.apiId),
                    this.apiHash,
                    (value: string) => {
                        this.qrCodeValue = value;
                        if (value) this.showQRCode = true;
                    },
                    (isLoggedIn: boolean) => {
                        this.isLoggedIn = isLoggedIn;
                    }
                );
                // alert('Logged In');
                this.isLoggedIn = true;
            } catch (error) {
                console.error(error);
                alert('Failed to login. Try again');
            }
        },

        saveCredentials() {
            CredentialManager.setAppId(this.apiId!);
            CredentialManager.setAppSecret(this.apiHash);

            this.saved = true;
            alert('Credentials saved.');
        },
    }
};
</script>

<style>
.channel-info {
    max-height: 50px;
    overflow: auto;
}
</style>
