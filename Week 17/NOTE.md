

# 工具链

## 初始化与构建

所有的工具的开端就是我们的脚手架，但脚手架和工具链并不是一回事，gennerator成为脚手架。Yeoman是现在社区比较流行的脚手架生成器，即gennerator的gennerator，通过Yeoman的这个框架可以轻易的开发一个能够初始化项目创建模板的工具。

### Yeoman 的使用

##### 1. 基本使用

* 空文件夹，npm init ，安装yeoman依赖
* 包名必须为generator开头

* 目录结构

```
├───package.json
├───app/
│   └───index.js
└───router/
    └───index.js
```

* 代码：

```js
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
    }
    method1() {
      this.log('method 1 just ran');
    }
  
    method2() {
      this.log('method 2 just ran');
    }
};
```

* npm link
  * 由于我们是在本地开发生成器，因此尚未作为全局npm模块提供。可以使用npm创建一个全局模块并将其符号链接到本地模块。
  * 在命令行上，从生成器项目的根目录（在generator-name /文件夹中），键入：```npm link```
  * 这将安装我们的项目依赖项，并将全局模块符号链接到本地文件。
* Yo yeoman 启动项目
  * 全局安装yeoman ```npm install -g yo```

##### 2. Yeoman的使用

Yeoman支持的功能：

* 同步、异步的method
* ```this.log ```: 用于输出
* ```this.prompt ```:用于与用户输入交互

```js
// app/index.js  
async prompting() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
      {
        type: "confirm",
        name: "cool",
        message: "Would you like to enable the Cool feature?"
      }
    ]);

    this.log("app name", answers.name);
    this.log("cool feature", answers.cool);
  }
```

* 文件模板系统

```
// 目录结构
├───package.json
├───app/
	 └───templates
	 		└───index.html
   └───index.js
```

```html
<html>
  <head>
    <title><%= title %></title>
  </head>
</html>
```

```js
// app/index.js  
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
    }
    writing() {
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('public/index.html'),
        { title: 'Templating with Yeoman' } // 这个json参数会覆盖模板里面的类似 <%= title %>这样的代码部分
      );
    }
};
```

然后在别的文件夹里运行```yo toolchain```命令就会生成public以及index.html

* 依赖系统

```js
// app/index.js
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
    }
    writing() {
      const pkgJson = {
        devDependencies: {
          eslint: '^3.15.0'
        },
        dependencies: {
          react: '^16.2.0'
        }
      };
  
      // Extend or create package.json file in destination path
      this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    }
    install() {
      this.npmInstall();
    }
};
```

### Vue项目的generator实战

```js
// app/index.js
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
    }
    async initPackge () {
      const answers = await this.prompt([
        {
          type: "input",
          name: "name",
          message: "Your project name",
          default: this.appname // Default to current folder name
        },
        {
          type: "input",
          name: "title",
          message: "Your html title",
          default: this.appname // Default to current folder name
        }
      ]);
      const pkgJson = {
        "name": answers.name,
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "ISC",
        "devDependencies": {
        },
        "dependencies": {
        }
      };
      this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
      this.npmInstall(['vue'], {'save-dev': false});
      this.npmInstall([
        'webpack',
        'vue-loader', 
        'vue-template-compiler', 
        'vue-style-loader', 
        'css-loader',
        'copy-webpack-plugin'
      ], {'save-dev': true});
      this.fs.copyTpl(
        this.templatePath('HelloWorld.vue'),
        this.destinationPath('src/HelloWorld.vue'),
        {}
      );
      this.fs.copyTpl(
        this.templatePath('webpack.config.js'),
        this.destinationPath('webpack.config.js'),
        {}
      );
      this.fs.copyTpl(
        this.templatePath('main.js'),
        this.destinationPath('src/main.js'),
        {}
      );
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('src/index.html'),
        { title: answers.title }
      );
    }
};
```

使用了上述generator初始化，并使用webpack打包之后的项目结构如下：

```shell
// vue-demo目录结构
├───package.json
├───webpack.config.js
├───dist
		└───main.js
		└───index.html
├───src
	 └───main.js
	 └───index.html
   └───HelloWorld.vue
```



### Webpack的基本知识

对于一个工具链来说，经过一系列的初始化操作，接下了最重要的工作就是build它。build的能力是一种独立的能力，它是同时为开发以及发布服务基础设施。

提到build工具，就不得不提到Webpack。Webpack是一种常见的build工具，它最初是为**Node**设计的一款打包工具，它可将一个**Node**的代码打包成一个浏览器可用的代码，所以它从最初的设计上是一个完全针对于JS的这样的一个系统，并没有涉及到html的部分，以至于现在有许多的后起之秀的打包工具是基于html去打包的，相比之下对于配置的要求就要低得多。

Webpack的核心思路就是将所有相关的代码，经过一系列build操作之后，打包成一个js文件，并需要我们手工的引用js文件到html。

Webpack可以帮助我们做多文件合并，在合并的过程中它可以通过各种各样的loader和plugin去控制合并的一些规则，并进而对文本进行一些转换。

##### webpack安装使用

webpack的config是一个js文件的形式，通过这个config我们可以改变webpack命令的一些行为。

* 安装
  * webapack-cli：提供webpack命令
  * webpack
  * 所以一般初始化项目的时候，我们会将webpack-cli在webpack的依赖中去掉的
* 安装方法
  * 不安装webpack-cli
    * 局部安装webpack-cli 
    * 使用npx webpack启动webpack
  * 全局安装webpack-cli、webpack

##### Webpack核心概念

- [入口(entry)](https://webpack.docschina.org/concepts/#entry)
- [输出(output)](https://webpack.docschina.org/concepts/#output)
- [loader](https://webpack.docschina.org/concepts/#loaders)
- [插件(plugin)](https://webpack.docschina.org/concepts/#plugins)
- [模式(mode)](https://webpack.docschina.org/concepts/#mode)
- [浏览器兼容性(browser compatibility)](https://webpack.docschina.org/concepts/#browser-compatibility)
- [环境(environment)](https://webpack.docschina.org/concepts/#environment)

###### loader

其中loader是webpack的灵魂，它可以将一个source转化为一个目标代码，是一个纯粹的文本转换。webpack通过import和require将转好的文件引入进来，配置项中的test属性决定什么样的后缀文件使用什么样的loader，并且支持多个loader去处理同一个文件。这是Webapack的一个核心机制。

### Babel基本知识

Babel的作用是将新版本的JS编译成老版本的JS。

##### 安装使用

运行以下命令安装所需的包（package）：

```shell
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
```

在项目的根目录下创建一个命名为 `babel.config.json` 的配置文件（需要 `v7.8.0` 或更高版本），并将以下内容复制到此文件中：

```json
{
  "presets": [
    [
      "@babel/env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1",
        },
        "useBuiltIns": "usage",
        "corejs": "3.6.5",
      }
    ]
  ]
}
```

* @babel/preset-env : babel配置繁琐，这里存储了一些常用的babel配置

运行此命令将 `src` 目录下的所有代码编译到 `lib` 目录：

```shell
./node_modules/.bin/babel src --out-dir lib
```

这就是babel独立使用的一些操作，但是实际上我们并不会独立使用它，而是使用```babel-loader```,将babel工具用于Webpack打包的过程中，对每个文件都执行babel操作。





