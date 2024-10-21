const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// CORS設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

let documentsData = JSON.parse(fs.readFileSync('documents.json', 'utf8'));

// デバッグ用のログ
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// ルートパスのルーティングを追加
app.get('/', (req, res) => {
  console.log('Rendering index page');
  res.render('index', { documents: documentsData });
});

// 再帰的にリンクを取得する関数
function getLinksRecursively(documentId, tweetId, visitedLinks = new Set()) {
  const document = documentsData[documentId];
  if (!document) return null;

  const tweet = document.tweets.find(t => t.id === tweetId);
  if (!tweet) return null;

  const linkKey = `${documentId}/${tweetId}`;
  if (visitedLinks.has(linkKey)) return null;

  visitedLinks.add(linkKey);

  const result = {
    ...tweet,
    document: {
      displayName: document.displayName,
      accountId: document.accountId
    }
  };

  if (tweet.links && tweet.links.length > 0) {
    result.links = tweet.links.map(link => {
      const [linkedDocumentId, linkedTweetId] = link.url.split('/');
      const linkedContent = getLinksRecursively(linkedDocumentId, linkedTweetId, new Set(visitedLinks));
      return {
        ...link,
        content: linkedContent
      };
    });
  }

  return result;
}

// 既存のルーティング
app.get('/document/:documentId', (req, res) => {
  const documentId = req.params.documentId;
  const document = documentsData[documentId];

  if (!document) {
    console.log(`Document not found: ${documentId}`);
    return res.status(404).send('Document not found');
  }

  console.log(`Rendering document page for: ${documentId}`);
  res.render('document', { document });
});

app.get('/document/:documentId/:tweetId', (req, res) => {
  const documentId = req.params.documentId;
  const tweetId = req.params.tweetId;
  const document = documentsData[documentId];

  if (!document) {
    console.log(`Document not found: ${documentId}`);
    return res.status(404).send('Document not found');
  }

  const tweetWithLinks = getLinksRecursively(documentId, tweetId);

  if (!tweetWithLinks) {
    console.log(`Tweet not found: ${tweetId}`);
    return res.status(404).send('Tweet not found');
  }

  console.log(`Rendering tweet page for: ${documentId}/${tweetId}`);
  const currentUrl = `/document/${documentId}/${tweetId}`;
  const backUrl = req.query.back || null;
  res.render('tweet', { document, tweet: tweetWithLinks, currentUrl, backUrl });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});