/**
 * server for example test
  */

const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const serve = require('koa-static');
const fs = require('fs');

app.use(serve('./'));

router.get('/', function (ctx, next) {
    ctx.body = fs.readFileSync('./example/index.html', 'utf8');
});

router.all('/rest/user', function (ctx, next) {
    ctx.body = JSON.stringify({
        code: 200,
        message: 'success',
        value: {
            name: 'lzwme',
            id: '11',
            site: 'https://lzw.me'
        }
    });
});

router.get('*', function (ctx, next) {
    ctx.body = JSON.stringify({
        code: 1000,
        message: 'not fond.',
        value: false
    });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3011, () => {
    console.log('listen port 3011.');
});
