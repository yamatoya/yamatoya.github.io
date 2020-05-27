const merge = require('webpack-merge') // webpack-merge
const common = require('./webpack.config.js') // 汎用設定をインポート

// common設定とマージする
module.exports = merge(common, {
    mode: 'production', // 開発モード
})