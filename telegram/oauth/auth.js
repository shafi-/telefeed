const clientId = process.env.APP_ID; // Provided by Telegram
const redirectUri = process.env.API_ENDPOINT + '/auth-callback'; // Your serverless function URL
const scope = 'your-requested-scope';

const oauthUrl = `https://my.telegram.org/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

window.location.href = oauthUrl;
