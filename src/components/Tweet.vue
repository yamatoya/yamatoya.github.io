<template>
  <div v-if="document && tweet" class="tweet-container">
    <div class="tweet-profile-header">
      <a @click="goBack" class="tweet-back-link">←</a>
      <h1>{{ document.displayName }}</h1>
    </div>
    <div class="tweet">
      <div class="tweet-header">
        <span class="index">{{ tweet.index }}</span>
        <span class="document-title">{{ document.displayName }}</span>
      </div>
      <p class="tweet-content" v-html="highlightedContent"></p>
      <div class="tweet-actions">
        <button class="copy-url-btn" @click="copyUrl">
          <i class="fas fa-link"></i> URLをコピー
        </button>
      </div>
      <div v-if="tweet.links && tweet.links.length > 0" class="tweet-links">
        <h3>関連リンク:</h3>
        <tweet-links :links="tweet.links" :base-url="$route.params.documentId"></tweet-links>
      </div>
    </div>
  </div>
</template>

<script>
import documentsData from '../documents.json'
import TweetLinks from './TweetLinks.vue'

export default {
  name: 'Tweet',
  components: {
    TweetLinks
  },
  data() {
    return {
      document: null,
      tweet: null
    }
  },
  created() {
    this.loadTweetData()
  },
  watch: {
    '$route': 'loadTweetData'
  },
  methods: {
    loadTweetData() {
      this.document = documentsData[this.$route.params.documentId]
      this.tweet = this.document.tweets.find(t => t.id === this.$route.params.tweetId)
    },
    copyUrl() {
      const url = window.location.href
      navigator.clipboard.writeText(url).then(() => {
        alert('URLがコピーされました')
      }, (err) => {
        console.error('URLのコピーに失敗しました', err)
      })
    },
    goBack() {
      if (window.history.length > 2) {
        this.$router.go(-1)
      } else {
        this.$router.push(`/document/${this.$route.params.documentId}`)
      }
    }
  },
  computed: {
    highlightedContent() {
      let content = this.tweet.content
      if (this.tweet.links && this.tweet.links.length > 0) {
        this.tweet.links.forEach(link => {
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