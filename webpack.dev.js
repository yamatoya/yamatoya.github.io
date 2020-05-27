const merge = require('webpack-merge') // webpack-merge
const common = require('./webpack.config.js') // 汎用設定をインポート
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// common設定とマージする
module.exports = merge(common, {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: 'development',
    plugins: [
        new BundleAnalyzerPlugin()
    ],
})