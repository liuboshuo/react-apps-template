const glob = require("glob")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const utils = require("./utils")

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
    const moduleList = getModuleList();
    
    let entry = {};
    for(let index in moduleList){
        const moduleName = moduleList[index]
        entry[moduleName] = "./src/modules/" + moduleName + "/index.js"
    }
    // 额外添加./src/index的配置(把这个也当做一个页面)
    entry["app"] = "./src/index.js"
    return entry
}


// 获取htmlwebpackplugin列表
function getHtmlWebpackPluginList(options={}){
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
            HtmlWebpackPluginOptions = Object.assign(HtmlWebpackPluginOptions,{
                minify: {
                    removeComments: true,               //去注释
                    collapseWhitespace: true,           //压缩空格
                    removeAttributeQuotes: true         //去除属性引用
                },
            })
        }
        HtmlWebpackPluginList.push(new HtmlWebpackPlugin(HtmlWebpackPluginOptions))
    }
    return HtmlWebpackPluginList;
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
    getRewritesList
};