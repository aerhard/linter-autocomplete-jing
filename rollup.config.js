
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

export default {
  entry: 'src/main.js',
  format: 'cjs',
  plugins: [babel(babelrc())],
  banner: '`',
  footer: '`',
  dest: 'lib/main.coffee',
};
