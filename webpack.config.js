// 该配置基于webpack2.0 详情查看 https://webpack.js.org/guides/migrating/
const path = require('path'); // 导入路径包
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

var fs = require('fs');


var fileObj = {};

//遍历./src下所有文件。。所有的js文件都添加到fileObj对象中。实时监控js的变化
function ls(ff){
    var files = fs.readdirSync(ff);
    for (var fn in files) {
        var fname = ff+path.sep+files[fn]; 
        var stat = fs.lstatSync(fname);  
        if(stat.isDirectory() == true)  
        {  
            ls(fname);  
        }  
        else  
        {  
            var _index = isJsSuffix(files[fn]);
            if (_index > -1) {
                fileObj[files[fn].slice(0, _index)] = fname;
            }
        }  
        // console.log("----------------------")
        // console.log(fileObj)
    }
}

function isJsSuffix(filename) {
    var _index = filename.lastIndexOf('.');
    
    if (filename.slice(_index + 1) === 'js') {
        return _index;
    }
    return -1;
}

ls('./src')

module.exports = {
    //devtool: 'eval-source-map', //开启sourceMap便于调试
    entry:fileObj, //入口文件
    output: {
        path: path.resolve(__dirname, 'dist/js'), // 指定打包之后的文件夹
        //publicPath: '/assets/', //指定资源文件引用的目录
        publicPath: '/dist/js',      //资源目录很重要。dev的时候用
        // filename: 'bundle.js' // 指定打包为一个文件 bundle.js
        filename: '[name].js', // 可以打包为多个文件
        chunkFilename:'[name].js'
    },
    // 使用loader模块
    module: {
        /* 在webpack2.0版本已经将 module.loaders 改为 module.rules 为了兼容性考虑以前的声明方法任然可用，同时链式loader(用!连接)只适用于module.loader
        同时-loader不可省略 */
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader', {
                    loader: 'css-loader',
                    options: {
                        // modules: true // 设置css模块化,详情参考https://github.com/css-modules/css-modules
                    }
                }, {
                    loader: 'postcss-loader',
                    // 在这里进行配置，也可以在postcss.config.js中进行配置，详情参考https://github.com/postcss/postcss-loader
                    options: {
                        plugins: function() {
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }
            ]
        }, {
            test: /\.styl(us)?$/,
            use: [
                'style-loader', 'css-loader', {
                    loader: "postcss-loader",
                    options: {
                        plugins: function() {
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }, 'stylus-loader'
            ]
        }, {
            test: /\.js$/,
            loader: 'babel-loader', //此处不能用use，不知道为啥
            exclude: /node_modules/ //需要排除的目录
        }]
    },
    // 配置devServer各种参数
    devServer: {
        // contentBase: "./", // 本地服务器所加载的页面所在的目录
        hot: true, // 配置HMR之后可以选择开启
        historyApiFallback: true, // 不跳转
        inline: true // 实时刷新
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html' // 模版文件
        }),
        //提取公共部分
        new CommonsChunkPlugin({
            name: 'commons',
            filename: 'commons.min.js',
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/rxjs/rxjs.html'
        // }),

        //--config ./webpack.production.config.js
        new webpack.HotModuleReplacementPlugin() // 热加载插件
    ]
}