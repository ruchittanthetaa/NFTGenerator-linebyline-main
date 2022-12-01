const fs = require("fs"); // We Love HASHLIPS!!!
const path = require("path");
const sha1 = require("sha1");
const { createCanvas, loadImage } = require("canvas");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
} = require(path.join(basePath, "/src/config.js"));
const console = require("console");
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
var metadataList = [];
var attributesList = [];
var dnaList = [];

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 0;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  if (_str) {
    var dna = Number(_str.split(":").shift());
    return dna;
  }
  return [];
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    blendMode:
      layerObj["blend"] != undefined ? layerObj["blend"] : "source-over",
    opacity: layerObj["opacity"] != undefined ? layerObj["opacity"] : 1,
  }));
  return layers;
};

const saveImage = (realFileName) => {
  fs.writeFileSync(
    `${buildDir}/images/${realFileName}`, // Wanna change name of your NFTs?
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition, realFileName) => {
  let dateTime = Date.now();
  let tempMetadata = {
    dna: sha1(_dna.join("")),
    name: `#${_edition}`,
    description: description,
    image: `${baseUri}/${realFileName}`,
    edition: _edition,
    date: dateTime,
    attributes: attributesList,
    compiler: "HashLips Art Engine",
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  return new Promise(async (resolve) => {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    resolve({ layer: _layer, loadedImage: image });
  });
};

const drawElement = (_renderObject) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blendMode;
  ctx.drawImage(_renderObject.loadedImage, 0, 0, format.width, format.height);
  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = [], _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna[index])
    );
    return {
      name: layer.name,
      blendMode: layer.blendMode,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

const isDnaUnique = (_DnaList = [], _dna = []) => {
  let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  return foundDna == undefined ? true : false;
};

// const createDna = (_layers) => {
//   let randNum = [];
//   _layers.forEach((layer) => {
//     var totalWeight = 0;
//     layer.elements.forEach((element) => {
//       totalWeight += element.weight;
//     });
//     // console.log(totalWeight);
//     // number between 0 - totalWeight
//     for (i = 0; i < 5; i++) {
//       let random = i * totalWeight;
//       console.log(random, "-----------", i);
//       console.log(layer.elements.length);
//       for (var j = 0; j < layer.elements.length; j++) {
//         // subtract the current weight from the random weight until we reach a sub zero value.
//         random -= layer.elements[j].weight;

//         console.log(random, "random");
//         if (random < 0) {
//           return randNum.push(
//             `${layer.elements[j].id}:${layer.elements[j].filename}`
//           );
//         }
//       }
//     }
//   });

//   return randNum;
// };

// const createDna = (_layers) => {
//   let randNum = [];

//   _layers.forEach((layer) => {
//     var totalWeight = 0;

//     layer.elements.forEach((element) => {
//       totalWeight += element.weight;
//     });

//     console.log(totalWeight);
//   });
//   //   // number between 0 - totalWeight
//   //   for (let index = 0; index < 1; index++) {
//   //     let random = Math.floor(index * totalWeight);
//   //     // console.log(random);
//   //     // for (var i = 0; i < layer.elements.length; i++) {
//   //     //   // subtract the current weight from the random weight until we reach a sub zero value.
//   //     //   random -= layer.elements[i].weight;
//   //     //   if (random < 0) {
//   //     //     return randNum.push(
//   //     //       `${layer.elements[i].id}:${layer.elements[i].filename}`
//   //     //     );
//   //     //   }
//   //     // }
//   //   }
//   //   // let random = Math.floor(Math.random() * totalWeight);

//   //   // for (var i = 0; i < layer.elements.length; i++) {
//   //   //   // subtract the current weight from the random weight until we reach a sub zero value.
//   //   //   random -= layer.elements[i].weight;
//   //   //   if (random < 0) {
//   //   //     return randNum.push(
//   //   //       `${layer.elements[i].id}:${layer.elements[i].filename}`
//   //   //     );
//   //   //   }
//   //   // }
//   // });
//   return randNum;
// };

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    var randomDAta = Math.random();
    console.log(randomDAta, "randomDAta");
    let random = Math.floor(randomDAta * totalWeight);

    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}`
        );
      }
    }
  });
  return randNum;
};

// const createDna = (_layers) => {
//   let randNum = [];
//   _layers.forEach((layer) => {
//     var totalWeight = 0;
//     layer.elements.forEach((element) => {
//       totalWeight += element.weight;
//     });
//     // number between 0 - totalWeight

//       for (var i = 0; i < layer.elements.length; i++) {
//         for (var j = 0; j < 19; j++) {
//           let random = i * totalWeight;
//         // subtract the current weight from the random weight until we reach a sub zero value.
//             random -= layer.elements[i].weight;
//             if (random < 0) {
//               return randNum.push(
//                 `${layer.elements[i].id}:${layer.elements[i].filename}`
//               );
//             }
//       }
//     }
//   });
//   return randNum;
// };
const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`, // Change name of NFT here as well so they all match
    JSON.stringify(
      metadataList.find((meta) => meta.edition == _editionCount),
      null,
      2
    )
  );
};

const startCreating = async () => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = await createDna(layers);

      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          ctx.clearRect(0, 0, format.width, format.height);
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject) => {
            drawElement(renderObject);
          });
          // console.log(newDna, "getFileNamegetFileNamegetFileNamegetFileName");
          var getFileName = newDna[0];
          // console.log(getFileName);
          var realFileName = getFileName.split(":")[1];
          // var realFileName = "realFileName";
          console.log(editionCount, "editionCount");
          saveImage(realFileName);
          addMetadata(newDna, editionCount, realFileName);
          saveMetaDataSingleFile(editionCount);
          console.log(
            `Created edition: ${editionCount}, with DNA: ${sha1(
              newDna.join("")
            )}`
          );
        });

        dnaList.push(newDna);
        editionCount++;
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
