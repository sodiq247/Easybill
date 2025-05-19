const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { resolver } = config;

  // Support for .svg files
  resolver.assetExts = resolver.assetExts.filter((ext) => ext !== "svg");
  resolver.sourceExts = [...resolver.sourceExts, "svg"];

  return config;
})();
