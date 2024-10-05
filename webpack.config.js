const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production", 
    target: "web",
    entry: path.join(__dirname, 'src', 'index.ts'),
    resolve: {
        extensions: ['.ts', '.js', '.css'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 5000,
    },
    watchOptions: {
        ignored: /node_modules/
    },
    plugins: [
        new HtmlWebpackPlugin({
            minify: true,
            template: path.join(__dirname, 'src', 'index.html')
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            }
        ],
    }
};