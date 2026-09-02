import { rspack } from '@rspack/core'
import { beastOctane } from 'beast-tsrx/rspack'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default {
  context: root,
  entry: './src/main.ts',
  output: {
    path: fileURLToPath(new URL('./dist', import.meta.url)),
    filename: 'assets/[name]-[contenthash:8].js',
    chunkFilename: 'assets/[name]-[contenthash:8].js',
    cssFilename: 'assets/[name]-[contenthash:8].css',
    cssChunkFilename: 'assets/[name]-[contenthash:8].css',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.btsx', '.tsrx', '.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.mts', '.cjs', '.cts']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['postcss-loader'],
        parser: {
          url: false
        },
        type: 'css'
      }
    ]
  },
  plugins: [
    beastOctane(),
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'favicon.ico', to: 'favicon.ico' }
      ]
    }),
    new rspack.HtmlRspackPlugin({
      template: './index.html'
    })
  ],
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 5173
  },
  performance: {
    maxAssetSize: 500 * 1024,
    maxEntrypointSize: 500 * 1024
  }
}
