# Ajax-Data-Model

[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

ajax 数据请求模型封装。在 ajax 请求的生命周期过程中，实现基于项目约定的通用行为操作。

## 特性

* umd 支持
* memory/sessionStorage/localStorage 级数据缓存支持
* Promise thenable 风格的 API 调用
* 基于接口约定的通用回调处理支持(通用错误处理、loading 状态、通用参数、埋点上报<接口超时、接口错误、接口异常、数据埋点等>...)

## 快速开始

### 1. 下载安装

手动下载：到代码仓库下载 [release](https://github.com/lzwme/ajax-data-model/releases) 的 zip 包，取得 `dist` 目录内文件即可。

npm 方式：

```
npm i --save ajax-data-model
```

### 2. 使用

#### 2.1 浏览器中直接引用使用

A. 引入 `jquery.min.js` 和 `adm.jquery.min.js`

```javascript
<script src="lib/jquery/juqery.min.js"></script>
<script src="lib/ajax-data-model/adm.jquery.min.js"></script>
```

B. 使用

```javascript
<script>
  var adm = window.adm;

  // 全局性设置
  adm.setSettings({...});

  // 使用
  adm.get({url: '/xxx'}).then((result) => {
    console.log(result);
  });
</script>
```

#### 2.2 ES6 方式使用

A. 全局性设置

```javascript
// adm.js
import $ from 'jquery';
import adm from 'ajax-data-model';

// 全局性设置
adm.setSettings({...});

// 示例：注册添加 API 到 adm 上(方便引用)
adm.restapi = {
  userlist: '/rest/user/list'
};
// todo more...

export default adm;
```
具体可参考 `src/common/settings.js` 中的参数配置示例。

B. 使用

```javascript
import adm from './adm';
// 使用示例
adm.get({url: '/xxx'}).then((result) => {
  console.log(result);
});
```

更多详细用法示例：[USEAGE.md](https://github.com/lzwme/ajax-data-model/blob/master/USEAGE.md)

## 命令脚本与二次开发

* `npm start`：开启 `3131` 端口 web 服务，进行测试开发。
* `npm run dev`：开启开发监听模式，监听 `src` 目录。
* `npm test`：`mocha + chai` 测试(需先执行 `npm start`)。
* `npm run build`：构建生产环境使用源码 (mini) 到 `lib` 目录。
* `npm run jsdoc`：生成 `jsdoc` 风格的 `API` 文档。

## API

请参阅： [API](https://lzw.me/pages/demo/ajax-data-model/api/)

## License

ajax-data-model is released under the MIT license.

该插件由[志文工作室](http://lzw.me)开发和维护。

[npm-image]: https://img.shields.io/npm/v/ajax-data-model.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ajax-data-model
[github-tag]: https://img.shields.io/github/tag/lzwme/ajax-data-model.svg?style=flat-square
[github-url]: https://github.com/lzwme/ajax-data-model/tags
[travis-image]: https://img.shields.io/travis/lzwme/ajax-data-model.svg?style=flat-square
[travis-url]: https://travis-ci.org/lzwme/ajax-data-model
[coveralls-image]: https://img.shields.io/coveralls/lzwme/ajax-data-model.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/lzwme/ajax-data-model?branch=master
[david-image]: https://img.shields.io/david/lzwme/ajax-data-model.svg?style=flat-square
[david-url]: https://david-dm.org/lzwme/ajax-data-model
[license-image]: https://img.shields.io/npm/l/ajax-data-model.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/ajax-data-model.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/ajax-data-model
