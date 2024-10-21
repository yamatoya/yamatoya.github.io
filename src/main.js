import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Index from './components/Index.vue'
import Document from './components/Document.vue'
import Tweet from './components/Tweet.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Index },
    { path: '/document/:id', component: Document },
    { path: '/document/:documentId/:tweetId', component: Tweet, name: 'tweet' },
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// グローバルにルーターを公開
window.$router = router