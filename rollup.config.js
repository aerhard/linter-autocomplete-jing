
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import cleanup from 'rollup-plugin-cleanup';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/main.js',
  format: 'cjs',
  plugins: [
    babel(babelrc()),
    nodeResolve({
      jsnext: true,
      skip: ['atom', 'cross-spawn', 'sax', 'atom-package-deps'],
    }),
    cleanup(),
  ],
  banner: '`',
  footer: '`',
  dest: 'lib/main.coffee',
};
