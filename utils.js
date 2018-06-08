const pbf = require('pbf');
const VT = require('@mapbox/vector-tile');

const usage = `
usage: mvtview [file] [options]
example: mvtview path/to/tile.mvt --zxy 1/0/1

  --zxy (optional) set the tile ZXY information in the form of {z}/{x}/{y}
`;

const makeStyle = (buffer) => {
  let tile;
  try {
    tile = new VT.VectorTile(new pbf(buffer));
  } catch(err) {
    return Promise.reject(err);
  }

  const style = { layers: [] };
  for (let l in tile.layers) {
    let styleLayer = {};
    const layer = tile.layers[l];
    styleLayer.id = layer.name;
    styleLayer['source-layer'] = layer.name;
    styleLayer.source = 'view-tile';
    styleLayer.type = getSylingType(layer);
    styleLayer = setStyling(styleLayer);
    style.layers.push(styleLayer);
  }

  return Promise.resolve({ layers: sortByWeight(style) });
};

const getSylingType = (layer) => {
  const counts = [
    { type: 'Unknown', count: 0, styleType: 'line', weight: 0 },
    { type: 'Point', count: 0, styleType: 'circle', weight: 1 },
    { type: 'LineString', count: 0, styleType: 'line', weight: 2 },
    { type: 'Polygon', count: 0, styleType: 'line', weight: 3 }
  ];

  for (let i = 0; i < layer.length; i++) {
    counts[layer.feature(i).type].count++;
  }

  counts.sort((a, b) => {
    return b.count - a.count;
  });

  return counts[0].styleType;
};

const setStyling = (layer) => {
  switch(layer.type) {
    case 'circle':
      layer.layout = {};
      layer.paint = {
        'circle-radius': 5,
        'circle-color': getColor(),
        'circle-opacity': 0.75
      };
      break;
    case 'fill':
      layer.layout = {};
      layer.paint = {
        'fill-opacity': 0.10,
        'fill-color': getColor()
      };
      break;
    case 'line':
    default:
      layer.layout = {
        'line-join': 'round'
      };
      layer.paint = {
        'line-color': getColor(),
        'line-opacity': 0.75,
        'line-width': 1
      };
      break;
  };

  return layer;
};

const sortByWeight = (style) => {
  return style.layers.sort((a, b) => {
    b.weight - a.weight;
  });
};

let colorIterator = 0;
const colors = ['#FE00AE', '#9A0AFB', '#02A9FE', '#ACFD04', '#FBA905'];
const getColor = () => {
  const c = colors[colorIterator];
  colorIterator++;
  if (colorIterator >= colors.length-1) colorIterator = 0;
  return c;
};

module.exports = { usage, makeStyle };
