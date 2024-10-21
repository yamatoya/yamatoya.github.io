<template>
  <div>
    <h1>法律文書一覧</h1>
    <div class="document-list">
      <router-link v-for="(doc, id) in documents" :key="id" :to="'/document/' + id">
        <div class="document-item">
          <div class="document-icon">{{ doc.displayName.charAt(0) }}</div>
          <div class="document-info">
            <div class="document-name">{{ doc.displayName }}</div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import documentsData from '../documents.json'

export default {
  name: 'Index',
  data() {
    return {
      documents: documentsData
    }
  }
}
</script>