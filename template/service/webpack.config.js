// webpack.config.js
const path = require("path");
const packagejson = require('./package.json')
module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: `${packagejson.dmappId}.js`,
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    }
};
