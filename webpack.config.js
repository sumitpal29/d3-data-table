const path = require('path');
module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'd3table.js',
        library: 'd3table',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }]
    }
}

// var path = require('path');
// var webpack = require('webpack');

// module.exports = {
//     entry: './js/table.js',
//     output: {
//         path: path.resolve(__dirname, 'build'),
//         filename: 'main.bundle.js'
//     },
//     module: {
//         loaders: [{
//             test: /\.js$/,
//             loader: 'babel-loader',
//             query: {
//                 presets: ['es2015']
//             }
//         }]
//     },
//     stats: {
//         colors: true
//     },
//     externals: {
//         d3: 'd3'
//     },
//     devtool: 'source-map'
// };