// eslint-disable-next-line import/no-extraneous-dependencies
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'cjs',
  plugins: [babel()],
  banner: '`',
  footer: '`',
  dest: 'lib/main.coffee',
};
