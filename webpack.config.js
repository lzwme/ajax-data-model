var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;

var plugins = [],
    outputFile, config;
var libraryName = 'adm';

if (env === 'build') {
    plugins.push(new UglifyJsPlugin({
        minimize: true
    }));
    outputFile = libraryName + '.jquery.min.js';
} else {
    outputFile = libraryName + '.jquery.js';
}

config = {
    entry: [
        './src/adm.jquery.js'
    ],
    devtool: 'source-map',
    output: {
        path: __dirname + '/lib',
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [{
            test: /(\.jsx|\.js)$/,
            loader: 'babel',
            exclude: /(node_modules|bower_components)/
        }, {
            test: /(\.jsx|\.js)$/,
            loader: 'eslint-loader',
            include: path.join(__dirname, 'src'),
            exclude: /node_modules/
        }]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    },
    externals: {
        jquery: 'jquery'
    },
    plugins: plugins
};

module.exports = config;
