const appJson = require('./app.json');

module.exports = () => ({
  ...appJson.expo,
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000',
  },
  plugins: [...appJson.expo.plugins, 'expo-image-picker'],
});
