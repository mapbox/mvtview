const pbf = require('pbf');
const VT = require('@mapbox/vector-tile');

const usage = `
usage:
  mvtview [tile path] [options]

example:
  mvtview path/to/tile.mvt --zxy 1/0/1

  --token (optional) A public (pk.) Mapbox Access Token (by default uses $MapboxAccessToken from environment)
  --zxy   (optional) set the tile ZXY information in the form of {z}/{x}/{y}
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
    const stylingTypeInfo = getSylingType(layer);
    styleLayer._info = {};

    styleLayer.id = layer.name;
    styleLayer['source-layer'] = layer.name;
    styleLayer.source = 'view-tile';
    styleLayer.type = stylingTypeInfo.styleType;
    styleLayer = setStyling(styleLayer);
    style.layers.push(styleLayer);
    styleLayer._info.geometry = stylingTypeInfo.type;
    styleLayer._info.total_features = layer.length;
  }

  return Promise.resolve({ layers: sortByWeight(style) });
};

const getSylingType = (layer) => {
  const counts = [
    { type: 'Unknown', count: 0, styleType: 'line', weight: 0 },
    { type: 'Point', count: 0, styleType: 'circle', weight: 1 },
    { type: 'LineString', count: 0, styleType: 'line', weight: 2 },
    { type: 'Polygon', count: 0, styleType: 'fill', weight: 3 }
  ];

  for (let i = 0; i < layer.length; i++) {
    counts[layer.feature(i).type].count++;
  }

  counts.sort((a, b) => {
    return b.count - a.count;
  });

  return counts[0];
};

const setStyling = (layer) => {
  const color = getColor();
  layer._info.color = color;

  switch(layer.type) {
    case 'circle':
      layer.layout = {};
      layer.paint = {
        'circle-radius': 5,
        'circle-color': color,
        'circle-opacity': 0.75
      };
      break;
    case 'fill':
      layer.layout = {};
      layer.paint = {
        'fill-color': 'rgba(200, 200, 200, 0.01)',
        'fill-outline-color': color
      };
      break;
    case 'line':
    default:
      layer.layout = {
        'line-join': 'round'
      };
      layer.paint = {
        'line-color': color,
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
const colors = ['#8c50c7', '#ff3c96', '#dc2b28', '#448ee4', '#ff6e00', '#f0dc00', '#01aa46', '#666666'];
const getColor = () => {
  const c = colors[colorIterator];
  colorIterator++;
  if (colorIterator >= colors.length-1) colorIterator = 0;
  return c;
};

module.exports = { usage, makeStyle };
