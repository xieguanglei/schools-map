const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

webpackConfig.mode = 'production';
webpackConfig.devtool = undefined;

webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) { console.log('build fail', stats.toJson().errors); }
    else { console.log('build success'); }
});