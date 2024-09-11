<template>
    <div>
      <p>Processing your login...</p>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  
  async function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
  
    if (code) {
      const response = await fetch(`/api/auth-callback?code=${code}`);
      const result = await response.json();
  
      if (result.access_token) {
        localStorage.setItem('telegram-access-token', result.access_token);
        // Redirect to your app or load user data
      } else {
        console.error('Failed to authenticate');
      }
    }
  }
  
  onMounted(() => {
    handleAuthCallback();
  });
  </script>
  