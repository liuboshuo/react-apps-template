const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

  
exports.isDev = function (){
    return process.env.NODE_ENV === 'development';
}

exports.resolve = function (dir) {
    return path.resolve(__dirname, dir)
}

exports.assetsPath = function (_path) {
    return path.posix.join("static", _path)
}


function cssLoaders(options){
    options = options || {};
    const cssLoader = { 
        loader: 'css-loader',  // 转换css
        options:{
            sourceMap: options.sourceMap
        }
    };

    function generateLoaders(loader,loaderOptions){
        const loaders = [cssLoader,'postcss-loader'];
        if(loader){
            loaders.push({
                loader: loader+"-loader",
                options:Object.assign({},loaderOptions , {
                    sourceMap: options.sourceMap
                })
            })
        }
        if(options.extract){
            return [
                {
                    loader:MiniCssExtractPlugin.loader,
                    options:{
                        hmr: process.env.NODE_ENV != 'development',  // 开发环境热更新 ，然而不起作用
                        reloadAll:true,
                    }
                }
            ].concat(loaders);
        }else{
           return ['style-loader'].concat(loaders)
        }
    }

    const object = {
        css: generateLoaders(),
        less: generateLoaders("less")
    }
    const output = [];
    for(let key in object){
        const loader = object[key];
        output.push({
            test:new RegExp('\\.' + key + '$'),
            use:loader
        })
    }
    return output;
}

exports.cssLoaders = cssLoaders;