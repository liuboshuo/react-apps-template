const child_process = require("child_process");
const { getModuleList } = require("./module-entry");
const path = require("path")
const filePath = path.resolve(__dirname,"./build.js")
const fs = require("fs")

// 支持自定是模块打包
const modules = process.argv[2];

if(modules){
    const moduleList = modules.split(",")
    // 动态遍历每个模块，对每个模块开启子进程单独进行打包
    for(let index=0;index<moduleList.length;index++){
        const moduleName = moduleList[index];
        try{
            if(fs.statSync(path.resolve(__dirname, `./../src/modules/${moduleName}/index.js`))){
                console.log(`开始打包<<<<<<${moduleName}<<<<<模块`);
                // 同步执行脚本文件
                const result = child_process.execFileSync("node",[filePath,"single-bundle",moduleName]) // 第三个参数是是否是多页面
                process.stdout.write(result + '\n\n');
            }
        }catch(error){
            console.log(`${moduleName}模块不存在`)
        }
    }
}else{
    // 打包默认的app
    console.log(`开始打包默认模块`);
    const result = child_process.execFileSync("node",[filePath,"single-bundle"]) // 第三个参数不传
    process.stdout.write(result + '\n\n');

    const moduleList = getModuleList();
    console.log(moduleList)
    // 动态遍历每个模块，对每个模块开启子进程单独进行打包
    for(let index=0;index<moduleList.length;index++){
        const moduleName = moduleList[index];
        
        console.log(`开始打包<<<<<<${moduleName}<<<<<模块`);
        // 同步执行脚本文件
        const result = child_process.execFileSync("node",[filePath,"single-bundle",moduleName]) // 第三个参数是是否是多页面
        process.stdout.write(result + '\n\n');
    }
}

