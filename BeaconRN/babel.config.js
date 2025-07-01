module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
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
    ],
  ],
};
