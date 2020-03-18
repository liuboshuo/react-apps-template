const glob = require("glob")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const utils = require("./utils")


function isSingleBundle(str){
    return str === 'single-bundle'
}

// 获取各个模块名称
function getModuleList(){
    const moduleList = glob.sync("././src/modules/*");

    for(let index = 0 ; index < moduleList.length ; index++){
        const item = moduleList[index];
        const tmpList = item.split("/");
        moduleList[index] = tmpList[tmpList.length-1];
    }
    return moduleList;
}


// 获取webpack entry
function getBuildEntry(){
    const MODULE_NAME = process.env.MODULE_NAME  // 打包的模块
    const SINGLE_BUNDLE = process.env.SINGLE_BUNDLE;

    // 开发环境和多页面包括单页面
    if(utils.isDev() || SINGLE_BUNDLE == null){
        const moduleList = getModuleList();
    
        let entry = {};
        for(let index in moduleList){
            const moduleName = moduleList[index]
            entry[moduleName] = `./src/modules/${moduleName}/index.js`
        }
        // 添加默认打包入口文件
        entry["app"] = "./src/index.js"
        return entry
    }else if(isSingleBundle(SINGLE_BUNDLE)) {
        let entry = {}; // 单独打包
        if(MODULE_NAME){
            // modules下的入口
            entry[MODULE_NAME] = "./src/modules/" + MODULE_NAME + "/index.js";
        }else{
            // 默认的打包入口文件
            entry["app"] = "./src/index.js"
        }
        console.log(entry)
        return entry;
    }
}


// 获取htmlwebpackplugin列表
function getHtmlWebpackPluginList(options={}){

    const extractOptions = {
        minify: {
            removeComments: true,               //去注释
            collapseWhitespace: true,           //压缩空格
            removeAttributeQuotes: true         //去除属性引用
        },
    }
    const MODULE_NAME = process.env.MODULE_NAME  // 打包的模块
    const SINGLE_BUNDLE = process.env.SINGLE_BUNDLE;

    // 开发环境和多页面包括单页面
    if(utils.isDev() || SINGLE_BUNDLE == null){
        // 多页面打包
        const moduleList = getModuleList();
        const HtmlWebpackPluginList = [];
        for(let index in moduleList){
            const moduleName = moduleList[index];
            const HtmlWebpackPluginOptions = {
                filename: utils.resolve('./../dist/'+ moduleName+ '/index.html'), // html模板的生成路径
                template: utils.resolve("./../src/modules/" + moduleName + "/index.html"),//html模板
                inject: true, // true：默认值，script标签位于html文件的 body 底部
                chunks: [moduleName],  // 注入哪个名称bundel
            };
            if(options.extract){
                HtmlWebpackPluginOptions = Object.assign(HtmlWebpackPluginOptions,extractOptions)
            }
            HtmlWebpackPluginList.push(new HtmlWebpackPlugin(HtmlWebpackPluginOptions))
        }
        // 添加默认的输出模板文件
        HtmlWebpackPluginList.push(new HtmlWebpackPlugin(Object.assign({
            filename: utils.resolve('./../dist/index.html'), // html模板的生成路径
            template: 'index.html',//html模板
            inject: true, // true：默认值，script标签位于html文件的 body 底部
            chunks: ['app'],  // 注入哪个名称bundel
        },extractOptions)))
        return HtmlWebpackPluginList;
    }else if(isSingleBundle(SINGLE_BUNDLE)){
        // 多app打包
        const HtmlWebpackPluginList = [];
        if(MODULE_NAME){
            // modules目录下的打包模板文件配置
            HtmlWebpackPluginList.push(new HtmlWebpackPlugin(Object.assign({
                filename: utils.resolve('./../dist/'+ MODULE_NAME+ '/index.html'), // html模板的生成路径
                template: utils.resolve("./../src/modules/" + MODULE_NAME + "/index.html"),//html模板
                inject: true, // true：默认值，script标签位于html文件的 body 底部
                chunks: ['vendors',MODULE_NAME],  // 注入哪个名称bundel
            },extractOptions)));
        }else{
            // 添加默认的输出模板文件
            HtmlWebpackPluginList.push(new HtmlWebpackPlugin(Object.assign({
                filename: utils.resolve('./../dist/index.html'), // html模板的生成路径
                template: 'index.html',//html模板
                inject: true, // true：默认值，script标签位于html文件的 body 底部
                chunks: ['app'],  // 注入哪个名称bundel
            },extractOptions)))
        }
        if(options.extract){
            HtmlWebpackPluginOptions = Object.assign(HtmlWebpackPluginOptions,extractOptions)
        }
        return HtmlWebpackPluginList;
    }
    
}

// 打包的输出目录
function getPrdOutPutPath(){
    const MODULE_NAME = process.env.MODULE_NAME  // 打包的模块
    const SINGLE_BUNDLE = process.env.SINGLE_BUNDLE;

    // 开发环境和多页面包括单页面
    if(utils.isDev() || SINGLE_BUNDLE == null){
        return utils.resolve("../dist");
    }else if(isSingleBundle(SINGLE_BUNDLE)){
        // 多app打包
        if(MODULE_NAME){
            return utils.resolve(`../dist/${MODULE_NAME}`)
        }else{
            return utils.resolve("../dist");
        }
    }
}

// 打包资源的前缀路径
function getPublicPath(){
    const MODULE_NAME = process.env.MODULE_NAME  // 打包的模块
    const SINGLE_BUNDLE = process.env.SINGLE_BUNDLE;
    // 开发环境和多页面包括单页面
    if(utils.isDev() || SINGLE_BUNDLE == null){
        return "/"
    }else if(isSingleBundle(SINGLE_BUNDLE)){
        // 多app打包
        if(MODULE_NAME){
            return `/${MODULE_NAME}`
        }else{
            return `/`
        }
    }
}
// 获取开发环境重定向的规则，只在开发环境中使用
function getRewritesList(){
    // 获取各个模块
    const moduleList = getModuleList();

    // 需要在开发环境重写的规则数组
    const rewrites = [];  // webpack-dev-server的historyApiFallback中使用
    for(let index in moduleList){
        const moduleName = moduleList[index]
        // 以模块名开头的路径，重定向到 改模块下的index.html模板文件 比如路径一以/a开头，会重定向到a模块下的index.html 
        rewrites.push({
            from:new RegExp('^\/' + moduleName), 
            to:utils.resolve('/' + moduleName +'/index.html')
        })
    }
    return rewrites;
}



module.exports = {
    getModuleList,
    getBuildEntry,
    getHtmlWebpackPluginList,
    getRewritesList,
    getPrdOutPutPath,
    getPublicPath
};