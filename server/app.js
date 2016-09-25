/**
 * server for example test
  */

const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const serve = require('koa-static');
const fs = require('fs');
const port = process.env.PORT || 3131;

app.use(serve('./'));
app.use(serve('example/'));

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

app.listen(port, () => {
    const child = require('child_process');
    let open = 'open';

    console.log('listen port ' + port);
    // process.platform: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    if (process.platform === 'win32') {
        open = 'start';
    }

    child.exec(open + ' http://127.0.0.1:' + port);
});
