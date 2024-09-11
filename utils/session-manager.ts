import { StringSession, StoreSession } from 'telegram/sessions';

export default class SessionManager {
    hasSession() {
        const ss = new StoreSession('feed-session');
        ss.getAuthKey();
    }
}
