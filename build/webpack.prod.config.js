const webpackMerge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.config")
const utils = require("./utils")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const OptimizeCSSAssetsPlugin  = require("optimize-css-assets-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const { getPrdOutPutPath , getBuildEntry, getHtmlWebpackPluginList, getPublicPath} = require("./module-entry")


module.exports = webpackMerge(baseWebpackConfig,{
    // 指定构建环境  
    mode:"production",
    // 入口
    entry: getBuildEntry(),
    // 出口
    output: {
        path : getPrdOutPutPath(),
        filename: utils.assetsPath("js/[name].[hash].js") ,
        chunkFilename: utils.assetsPath("js/[name].[chunkhash].js"), // utils.assetsPath("js/[id].[chunkhash].js")
        publicPath: getPublicPath() // 打包后的资源的访问路径前缀
    },
    
    devtool: 'cheap-module-source-map',
    
    module:{
        rules:utils.cssLoaders({extract:true,sourceMap:true})
    },

    // 插件
    plugins:[
        // css压缩
        new MiniCssExtractPlugin({
            filename: utils.assetsPath('css/[name].[hash].css'),
            chunkFilename: utils.assetsPath('css/[id].[chunkhash].css'),
        }),
        new CleanWebpackPlugin(),
        // new BundleAnalyzerPlugin(),
    ].concat(getHtmlWebpackPluginList()),
    
    optimization: {
        // 压缩css
        minimizer: [
            // 自定义js优化配置，将会覆盖默认配置
            new UglifyJsPlugin({
                parallel: true,  //使用多进程并行运行来提高构建速度
                sourceMap: true,
                uglifyOptions: {
                    warnings: false,
                    compress: {
                        unused: true,
                        drop_debugger: true,
                        drop_console: true, 
                    },
                    output: {
                        comments: false // 去掉注释
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: { 
                    discardComments: { removeAll: true } // 移除注释
                } 
            })
        ],
        splitChunks: {
            chunks: "all",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 5,
            automaticNameDelimiter: '~',
            name:true,
            // 默认的配置
            cacheGroups: {

                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2, // 引用超过两次的模块 -> default
                    priority: -20,
                    reuseExistingChunk: true
                },
            },
        },
        runtimeChunk:{
            name:'manifest' // webpack的运行文件
        }
    },
})