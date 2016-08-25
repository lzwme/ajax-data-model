import './helpers/_helper';
import DataCache from '../src/common/DataCache';

/**
 * DataCache API 测试
 */
let dataCache;

function setAndGetTest(key, data) {
    let item;

    dataCache.setItem(key, data);
    item = dataCache.getItem(key);
    expect(item).to.be.equal(data);
}

describe('DataCache API 测试', function () {

    before(function () {
        dataCache = new DataCache();
    });

    it('getItem', () => {
        let item = dataCache.getItem('xxx');

        expect(item).to.be.equal(undefined);
    });

    it('setItem', () => {
        setAndGetTest('test1', 0);
        setAndGetTest('test1', 10);
        setAndGetTest('test2', undefined);
        setAndGetTest('test3', '测试测试');
        setAndGetTest('test4', {a: 1, b: 2, c: 5});
    });

    it('key', () => {
        let item;

        dataCache.clear();
        item = dataCache.key(0);
        expect(item).to.be.equal(null);

        dataCache.setItem('test', 111);
        item = dataCache.key(0);
        expect(item).to.be.equal('test');
    });

    it('removeItem', () => {
        setAndGetTest('test', '测试测试');
        expect(dataCache.getItem('test')).to.be.equal('测试测试');
        dataCache.removeItem('test');
        expect(dataCache.getItem('test')).to.be.equal(undefined);
    });

    it('length', () => {
        const dc = new DataCache();

        expect(dc.length).to.be.equal(0);

        dc.setItem('test', 1);
        expect(dc.length).to.be.equal(1);

        dc.setItem('test2', 1);
        expect(dc.length).to.be.equal(2);
    });

    it('clear', () => {
        dataCache.setItem('test', 1);
        expect(dataCache.length).to.be.ok;

        dataCache.clear();
        expect(dataCache.length).to.be.equal(0);
    });
});
