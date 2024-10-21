<template>
  <ul class="tweet-links-list">
    <li v-for="link in links" :key="link.url" class="tweet-link-item">
      <router-link 
        :to="getLinkTo(link)"
        class="link-title"
        @click.native="debugLink(link)"
      >
        {{ link.text }}
      </router-link>
      <div v-if="link.content" class="linked-content">
        <p v-if="link.content.content" v-html="highlightContent(link.content)"></p>
        <tweet-links
          v-if="link.content.links && link.content.links.length > 0"
          :links="link.content.links"
          :base-url="getBaseUrl(link)"
        ></tweet-links>
      </div>
    </li>
  </ul>
</template>

<script>
import documentsData from '../documents.json'

export default {
  name: 'TweetLinks',
  props: {
    links: {
      type: Array,
      required: true
    },
    baseUrl: {
      type: String,
      default: ''
    }
  },
  methods: {
    getLinkTo(link) {
      const [documentId, tweetId] = this.getFullUrl(link).split('/');
      return {
        name: 'tweet',
        params: { documentId, tweetId },
        query: { back: this.$route.fullPath }
      };
    },
    debugLink(link) {
      const to = this.getLinkTo(link);
      const fullPath = `/document/${to.params.documentId}/${to.params.tweetId}`;
      console.log('Debug: Clicked link', {
        text: link.text,
        url: link.url,
        to: to,
        fullPath: fullPath
      });
    },
    highlightContent(content) {
      if (!content || !content.links) return content.content;
      
      let highlightedContent = content.content;
      content.links.forEach(link => {
        const escapedLinkText = link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedLinkText})`, 'gi');
        highlightedContent = highlightedContent.replace(regex, '<span class="highlight">$1</span>');
      });
      return highlightedContent;
    },
    getFullUrl(link) {
      if (link.url.includes('/')) {
        return link.url;
      }
      return `${this.baseUrl}/${link.url}`;
    },
    getBaseUrl(link) {
      return this.getFullUrl(link).split('/')[0];
    },
    getLinkContent(link) {
      const [documentId, tweetId] = this.getFullUrl(link).split('/');
      const document = documentsData[documentId];
      if (document) {
        const tweet = document.tweets.find(t => t.id === tweetId);
        if (tweet) {
          return tweet;
        }
      }
      return null;
    }
  },
  created() {
    this.links.forEach(link => {
      if (!link.content) {
        link.content = this.getLinkContent(link);
      }
    });
  }
}
</script>

<style scoped>
.tweet-links-list {
  list-style-type: none;
  padding-left: 0;
}

.tweet-link-item {
  margin-bottom: 20px;
}

.link-title {
  font-weight: bold;
  color: #1da1f2;
  text-decoration: none;
}

.linked-content {
  margin-top: 10px;
  padding: 10px;
  border-left: 2px solid #e1e8ed;
  background-color: #f8f9fa;
}

.highlight {
  background-color: #caddf2;
  font-weight: bold;
}
</style>