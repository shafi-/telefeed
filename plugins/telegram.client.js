// import fetch from 'node-fetch';

// export default async function fetchMessages(accessToken, channelId, limit = 100) {
//   const response = await fetch(`https://api.telegram.org/bot${accessToken}/getUpdates?chat_id=${channelId}&limit=${limit}`);
//   const data = await response.json();
//   return data;
// }
export default defineNuxtPlugin({
    name: 'TG-helper',
    enforce: 'pre',
})
