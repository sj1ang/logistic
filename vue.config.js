const path = require('path')
const name = 'Vue Typescript Admin'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-typescript-admin-template/' : '/', // TODO: Remember to change this to fit your need
  lintOnSave: process.env.NODE_ENV === 'development',
  devServer: {
    host: '192.168.0.105',
    port: 9527,
    open: true,
  },
  pwa: {
    name: name
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  chainWebpack(config) {
    // Provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    config.set('name', name)
  }
}
