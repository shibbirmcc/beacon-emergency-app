module.exports = {
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  resolver: {
    alias: {
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@hooks': './src/hooks',
      '@types': './src/types',
      '@utils': './src/utils',
      '@constants': './src/constants',
      '@navigation': './src/navigation',
    },
  },
};
