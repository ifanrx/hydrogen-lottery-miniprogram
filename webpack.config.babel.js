import {resolve} from 'path';
import {
	DefinePlugin,
	EnvironmentPlugin,
	IgnorePlugin,
	optimize
} from 'webpack';
import WXAppWebpackPlugin, {Targets} from 'wxapp-webpack-plugin';
import DashboardPlugin from 'webpack-dashboard/plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';

const {NODE_ENV} = process.env;
const isDev = NODE_ENV !== 'production';
const srcDir = resolve('src');

const relativeFileLoader = (ext = '[ext]') => ({
	loader: 'file-loader',
	options: {
		useRelativePath: true,
		name: `[name].${ext}`,
		context: srcDir
	}
});

export default (env = {}) => {
	const min = env.min;
	const target = 'Wechat';
	return {
		entry: {
			app: [
				'./src/app.js'
			]
		},
		output: {
			filename: '[name].js',
			publicPath: '/',
			path: resolve('dist')
		},
		target: Targets[target],
		module: {
			rules: [
				{
					test: /\.js$/,
					use: [{
						loader: 'babel-loader',
						options: {
							babelrc: false,
							cacheDirectory: true,
							'presets': [
								'es2015',
								'stage-0',
							],
						},
					}, {
						loader: 'eslint-loader',
					}],
					exclude: [/node_modules/, resolve(__dirname, './src/lib')],
					include: resolve(__dirname, './src')
				},
				{
					test: /\.scss$/,
					include: /src/,
					use: [
						relativeFileLoader('wxss'),
						{
							loader: 'sass-loader',
							options: {
								includePaths: [resolve('src', 'styles'), resolve('./src')]
							}
						}
					]
				},
				{
					test: /\.(json|png|jpg|gif|wxss|svg)$/,
					include: resolve(__dirname, './src'),
					use: relativeFileLoader()
				},
				{
					test: /\.wxml$/,
					include: resolve('src'),
					use: [
						relativeFileLoader('wxml'),
						{
							loader: 'wxml-loader',
							options: {
								root: resolve('src'),
								enforceRelativePath: true
							}
						}
					]
				}
			]
		},
		plugins: [
			new EnvironmentPlugin({
				NODE_ENV: 'development'
			}),
			new DefinePlugin({
				__DEV__: isDev,
				wx: 'wx'
			}),
			new WXAppWebpackPlugin({
				clear: !isDev
			}),
			new optimize.ModuleConcatenationPlugin(),
			new IgnorePlugin(/vertx/),
			isDev && new DashboardPlugin(),
			min && new MinifyPlugin()
		].filter(Boolean),
		devtool: isDev ? 'source-map' : false,
		resolve: {
			modules: [resolve(__dirname, 'src'), 'node_modules'],
			alias: {
				'@': resolve('src')
			},
		},
		watchOptions: {
			ignored: /dist|manifest/,
			aggregateTimeout: 300
		}
	};
};
