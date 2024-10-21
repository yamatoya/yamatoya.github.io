<template>
  <div v-if="document">
    <div class="profile-header">
      <router-link to="/" class="back-link">←</router-link>
      <h1>{{ document.displayName }}</h1>
    </div>
    <div class="tweets">
      <div v-for="tweet in document.tweets" :key="tweet.id" class="tweet" @click="goToTweet(tweet.id)">
        <div class="tweet-header">
          <span class="index">{{ tweet.index }}</span>
          <span class="document-title">{{ document.displayName }}</span>
        </div>
        <p class="tweet-content" v-html="highlightContent(tweet)"></p>
      </div>
    </div>
  </div>
</template>

<script>
import documentsData from '../documents.json'

export default {
  name: 'Document',
  data() {
    return {
      document: null
    }
  },
  created() {
    this.document = documentsData[this.$route.params.id]
  },
  methods: {
    goToTweet(tweetId) {
      this.$router.push(`/document/${this.$route.params.id}/${tweetId}`)
    },
    highlightContent(tweet) {
      let content = tweet.content
      if (tweet.links && tweet.links.length > 0) {
        tweet.links.forEach(link => {
          const escapedLinkText = link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`(${escapedLinkText})`, 'gi')
          content = content.replace(regex, '<span class="highlight">$1</span>')
        })
      }
      return content
    }
  }
}
</script>