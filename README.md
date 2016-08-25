# Ajax-Data-Model

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

ajax 通用数据请求处理模型。在 ajax 请求的生命周期过程中，处理通用的约定行为操作。

## 特性

* umd 支持
* memory/sessionStorage/localStorage 级数据缓存支持
* 请求前后的按钮状态处理
* 基于接口约定的通用回调处理
* Promise thenable 风格的 API 调用

## 快速开始

### 下载安装

手动下载：到代码仓库下载 release 的 zip 包即可。

npm 方式：

```
npm i --save ajax-data-model
```

### 使用

**ES6 方式使用**

1. 全局性设置

```javascript
// adm.js
import $ from 'jquery';
import adm from 'ajax-data-model';
// 全局性设置
adm.setSettings({...}); 

adm.restapi = {
  userlist: '/rest/user/list'
};
// todo more...

export default adm;
```
具体参考 `src/common/settings.js` 中的参数配置示例。

2. 使用

```javascript
import adm from './adm';
// 使用示例
adm.get({url: '/xxx'}).then((result) => {
  console.log(result);
});
```

**直接引用使用：**

1. 引入 jquery 和 js

```javascript
<script src="lib/jquery/juqery.min.js"></script>
<script src="lib/ajax-data-model/adm.jquery.min.js"></script>
```

2. 使用

```javascript
<script>
  // 全局性设置
  adm.setSettings({...});
  // 使用
  adm.get({url: '/xxx'}).then((result) => {
    console.log(result);
  });
</script>
```

## 命令脚本与二次开发

* `npm start` - 开启 `3001` 端口 web 服务，进行测试开发。
* `npm run dev` - 开启开发监听模式，监听 `src` 目录。
* `npm test` - `mocha + chai` 测试(需先执行 `npm start`)。
* `npm run build` - 构建生产环境使用源码 (mini) 到 `lib` 目录。
* `npm run jsdoc` - 生成 `jsdoc` 风格的 `API` 文档。

## API

参阅： [API](https://lzw.me/pages/demo/ajax-data-model/api/)

更多示例：[USEAGE.md](https://github.com/lzwme/ajax-data-model/blob/master/USEAGE.md)

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/ajax-data-model.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ajax-data-model
[github-tag]: http://img.shields.io/github/tag/lzwme/ajax-data-model.svg?style=flat-square
[github-url]: https://github.com/lzwme/ajax-data-model/tags
[travis-image]: https://img.shields.io/travis/lzwme/ajax-data-model.svg?style=flat-square
[travis-url]: https://travis-ci.org/lzwme/ajax-data-model
[coveralls-image]: https://img.shields.io/coveralls/lzwme/ajax-data-model.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/lzwme/ajax-data-model?branch=master
[david-image]: http://img.shields.io/david/lzwme/ajax-data-model.svg?style=flat-square
[david-url]: https://david-dm.org/lzwme/ajax-data-model
[license-image]: http://img.shields.io/npm/l/ajax-data-model.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/ajax-data-model.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/ajax-data-model
