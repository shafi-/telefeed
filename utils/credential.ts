import { isClient } from './misc';

class CredentialManager {
    private static APP_ID_KEY = 'app_id';
    private static APP_SECRET_KEY = 'app_secret';

    static setAppId(appId: number): void {
        if (!isClient()) {
            return;
        }

        localStorage.setItem(CredentialManager.APP_ID_KEY, String(appId));
    }

    static getAppId(): number|undefined {
        if (!isClient()) {
            return undefined;
        }

        return Number(localStorage.getItem(CredentialManager.APP_ID_KEY));
    }

    static setAppSecret(appSecret: string): void {
        if (!isClient()) {
            return;
        }

        localStorage.setItem(CredentialManager.APP_SECRET_KEY, appSecret);
    }

    static getAppSecret(): string| undefined| null {
        if (!isClient()) {
            return undefined;
        }

        return localStorage.getItem(CredentialManager.APP_SECRET_KEY);
    }
}

export default CredentialManager;
