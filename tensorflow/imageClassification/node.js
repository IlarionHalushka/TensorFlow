const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const jpeg = require('jpeg-js');
require('@tensorflow/tfjs-node');

const NUMBER_OF_CHANNELS = 3;

const readImage = path => {
  const buf = fs.readFileSync(path);
  return jpeg.decode(buf, true);
};

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values;
};

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels);
  const outShape = [image.height, image.width, numChannels];
  return tf.tensor3d(values, outShape, 'int32');
};

const loadModel = async path => {
  const mn = new mobilenet.MobileNet(1, 1);
  mn.path = `file://mobile-net/model.json`;
  await mn.load();
  return mn;
};

const classify = async (model, path) => {
  console.time();
  const image = readImage(path);
  const input = imageToInput(image, NUMBER_OF_CHANNELS);

  const mn_model = await loadModel(model);

  const predictions = await mn_model.classify(input);
  console.timeEnd();

  console.log('classification results:', predictions);
};

// if (process.argv.length !== 4) throw new Error('incorrect arguments: node script.js <MODEL> <IMAGE_FILE>')
// classify(process.argv[2], process.argv[3])
classify(process.argv[2], process.argv[2]);

// to run classification: node node.js ant.jpg
