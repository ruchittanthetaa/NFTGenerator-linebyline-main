const { MODE } = require("./blendMode.js");
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri =
  "https://gateway.pinata.cloud/ipfs/(Paste CID of Pinata/IPFS Folder holding your IMAGE Files)";

const layerConfigurations = [
  {
    growEditionSizeTo: 100,
    layersOrder: [{ name: "Images" }, { name: "Status" }],
  },
];
const format = {
  width: 750, // change this to the dimension your NFT was created with in PSD
  height: 1200,
};

const background = {
  generate: false, // Value False if you don't have any Background
  brightness: "80%",
  static: false,
  default: "#000000",
};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
};
