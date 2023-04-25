const path = require('path')

const TerserPlugin = require("terser-webpack-plugin")
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { targetPath } = require('../path')

const isProd = process.env.NODE_ENV === 'production'

const loaders = {
  vueStyle: {
    loader: 'vue-style-loader',
    options: {
      sourceMap: false,
      shadowMode: false
    }
  },
  css: {
    loader: 'css-loader',
    options: {
      sourceMap: false,
      importLoaders: 2
    }
  },
  postcss: {
    loader: 'postcss-loader',
    options: {
      sourceMap: false
    }
  },
  less: {
    loader: 'less-loader',
    options: {
      sourceMap: false
    }
  }
}

const devPlugins = [
  new FriendlyErrorsWebpackPlugin({
    compilationSuccessInfo: {
      messages: ['You application is running here: http://localhost:8080'],
      notes: ['Some additionnal notes to be displayed unpon successful compilation']
    }
  }), // 错误提示友好插件
]

const envPlugins = isProd ? [] : devPlugins

module.exports = {
  devtool: isProd
    ? 'source-map'
    : 'eval-source-map',
  mode: isProd ? 'development' : 'production',
  output: {
    hashFunction: 'xxhash64', // v5.54.0+，该算法更快
    path: path.resolve(targetPath, './dist'),
    publicPath: '/',
    filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
    chunkFilename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js'
  },
  resolve: {
    alias: {
      public: path.resolve(targetPath, './public'),
      '@': path.resolve(targetPath, './src'),
      '~': path.resolve(targetPath, './src')
    },
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm']
  },
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      {
        test: /\.m?jsx?$/,
        resolve: {
          fullySpecified: false // 引入时是否提供扩展名
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.vue$/,
        resourceQuery: /type=style/, // 匹配loader解析后type=style
        sideEffects: true // 表明存在副作用，告诉webpack不能随意去除
      },
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'media/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss]
          },
          {
            resourceQuery: /\?vue/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss]
          },
          {
            test: /\.module\.\w+$/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss]
          },
          {
            use: [loaders.vueStyle, loaders.css, loaders.postcss]
          }
        ]
      },
      {
        test: /\.less$/,
        oneOf: [
          /* vue-modules */
          {
            resourceQuery: /module/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss, loaders.less]
          },
          {
            resourceQuery: /\?vue/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss, loaders.less]
          },
          /* normal-modules */
          {
            test: /\.module\.\w+$/,
            use: [loaders.vueStyle, loaders.css, loaders.postcss, loaders.less]
          },
          /* normal */
          {
            use: [loaders.vueStyle, loaders.css, loaders.postcss, loaders.less]
          }
        ]
      },
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [
                '\\.vue$'
              ],
              happyPackMode: false
            }
          }
        ]
      },
      {
        test: /\.tsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: false,
              appendTsxSuffixTo: [
                '\\.vue$'
              ]
            }
          }
        ]
      }
    ]
  },
  optimization: {
    realContentHash: false,
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin(), /** terser js代码压缩 */
      new CssMinimizerPlugin() /** cssnano 优化、压缩css */
    ]
  },
  performance: {
    maxEntrypointSize: 2500000,
    maxAssetSize: 1500000
  },
  plugins: [
    new VueLoaderPlugin(),
    new CaseSensitivePathsPlugin(),
    new ESLintWebpackPlugin({
      extensions: ['.js', '.jsx', '.vue', '.ts', '.tsx']
    }),
    new ForkTsCheckerWebpackPlugin(),
    ...envPlugins
  ]
}
