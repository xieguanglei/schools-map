const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const open = require('open');
const webpackConfig = require('./webpack.config');

const app = express();
const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, { publicPath: '' }));
app.use(express.static('./'));

const port = 3000;
app.listen(port, function () { open(`http://localhost:${port}`) });