const path = require('path');
const webpack = require('webpack');

module.exports = {
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: {
        index: './src/time-convert/index.ts',
        company: './src/company/index.ts',
        lokichart: './src/lokichart/index.ts',
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                // 拡張子 .ts の場合
                test: /\.ts$/,
                // TypeScript をコンパイルする
                use: 'ts-loader',
            },
        ],
    },
    optimization: {
        splitChunks: {
            chunks: 'initial',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/](moment|moment-timezone)[\\/]/,
                    name: "vendor"
                },
                companyVendor: {
                    test: /[\\/]node_modules[\\/](chart.js|chartjs-plugin-datalabels|feather-icons)[\\/]/,
                    name: "compnayvendor"
                },
            },
        },
    },
    plugins: [
        // load `moment/locale/ja.js` and `moment/locale/lb.js`
        // https://qiita.com/jimbo/items/95da1c223ad25a33ed16
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ja|lb/),
    ],
    // import 文で .ts ファイルを解決するため
    // これを定義しないと import 文で拡張子を書く必要が生まれる。
    // フロントエンドの開発では拡張子を省略することが多いので、
    // 記載したほうがトラブルに巻き込まれにくい。
    resolve: {
        // 拡張子を配列で指定
        extensions: [
            '.ts', '.js',
        ],
    },
};