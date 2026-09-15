// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // The project's own source tree is what we lint; generated output and the
    // Express backend (separate tsconfig/toolchain) are excluded.
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'backend/*', 'android/*', 'ios/*'],
  },
];
