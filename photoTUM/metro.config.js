// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for images in subdirectories
config.resolver.assetExts.push('jpg', 'jpeg', 'png');

module.exports = config;

