// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for images in subdirectories
config.resolver.assetExts.push('jpg', 'jpeg', 'png');

// Watch additional folders for symlinked images
config.watchFolders = [
  path.resolve(__dirname, './assets'),
  path.resolve(__dirname, './assets/images'),
  path.resolve(__dirname, './assets/images_hackatum2024'),
  path.resolve(__dirname, './assets/images_hackatum2023'),
];

module.exports = config;

