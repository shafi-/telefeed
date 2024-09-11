<template>
    <div>
      <button @click="redirectToTelegram">Login with Telegram</button>
    </div>
  </template>
  
  <script setup>
  const clientId = 'your-telegram-client-id'; // Provided by Telegram
  const redirectUri = 'https://your-app.com/auth/callback'; // Your serverless function URL
  const scope = 'your-requested-scope';
  
  function redirectToTelegram() {
    const oauthUrl = `https://my.telegram.org/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = oauthUrl;
  }
  </script>
  