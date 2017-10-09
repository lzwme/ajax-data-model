/**
 * global helpers
 * @see http://chaijs.com/api/bdd/
 */
import chai from 'chai';
import adm from '../../src/adm.jquery.js';
import jsdom from 'mocha-jsdom';
import fs from 'fs';

jsdom({
    url: 'http://127.0.0.1:3131',
    skipWindowCheck: true,
    html: undefined,
    src: fs.readFileSync('./node_modules/jquery/dist/jquery.js', 'utf-8')
});

global.fs = fs;
global.adm = adm;
global.chai = chai;

// 使用 chai.expect 断言
chai.expect();
global.expect = chai.expect;

// localStorage
const LocalStorage = require('node-localstorage').LocalStorage;

global.localStorage = new LocalStorage('./test/localStorageTemp');
before(function (next) {
    global.window = document.defaultView;
    global.localStorage = global.localStorage || new LocalStorage('./test/localStorageTemp');
    global.window.localStorage = global.localStorage;

    next();
});

// import test from 'ava';
// global.test = test;

// global.document = jsdom('<p></p>');
// global.window = document.defaultView;
// global.navigator = window.navigator;
