const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: "production",
	entry: {
		background: "./scripts/background.ts",
		content: "./scripts/content.ts",
		popup: "./scripts/popup.ts",
		options: "./scripts/options.ts",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
	},
	optimization: {
		splitChunks: false,
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "manifest.json", to: "manifest.json" },
				{ from: "./ui/popup.html", to: "popup.html" },
				{ from: "icons", to: "icons" },
				{ from: "./ui/popup.css", to: "popup.css" },
				{ from: "./ui/options.css", to: "options.css" },
				{ from: "./ui/options.html", to: "options.html" },
			],
		}),
	],
	devtool: false,
};
