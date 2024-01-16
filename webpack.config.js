class Without { // prend une liste de regex, et supprime les fichiers
    constructor(patterns) {
        this.patterns = patterns;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync("MiniCssExtractPluginCleanup", (compilation, callback) => {
            Object.keys(compilation.assets).filter(asset => {
                    let match = false;

                    let i = this.patterns.length;
                    while (i--) {
                        if (this.patterns[i].test(asset)) {
                            match = true;
                        }
                    }

                    return match;
                }).forEach(asset => {
                    delete compilation.assets[asset];
                });

            callback();
        });
    }
}


const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = {
    mode: 'development',
    entry: {
        bundle: path.resolve(__dirname, 'src/main.js')
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
        ],
    },
    optimization: {
        minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
        new MiniCssExtractPlugin({filename: '[name].css'}),
        new Without([/loading.js/]) // supprime loading.js car inutile
    ]
};

module.exports = config;
