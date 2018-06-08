const test = require('tape');
const mvtf = require('@mapbox/mvt-fixtures');

const makeStyle = require('../lib/make-style.js');

test('[lib/make-style.js] makes a style with a very simple tile', (assert) => {
  makeStyle(mvtf.get('017').buffer)
    .then((style) => {
      assert.equal(style.layers.length, 1, 'one layer');
      assert.equal(style.layers[0].id, 'hello', 'expected layer id');
      assert.equal(style.layers[0]['source-layer'], 'hello', 'expected source-layer id');
      assert.equal(style.layers[0].type, 'circle', 'expected Point > circle type');
      assert.deepEqual(style.layers[0].layout, {}, 'no layout properties');
      assert.ok(style.layers[0].paint['circle-radius'], 'has circle radius');
      assert.ok(style.layers[0].paint['circle-color'], 'has circle color');
      assert.ok(style.layers[0].paint['circle-opacity'], 'has circle opacity');
      assert.end();
    })
    .catch((err) => {
      assert.fail(err);
    });
});
