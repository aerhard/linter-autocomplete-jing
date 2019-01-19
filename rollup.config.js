
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import cleanup from 'rollup-plugin-cleanup';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  external: ['atom', 'cross-spawn', 'sax', 'atom-package-deps', 'net', 'path'],
  output: {
    format: 'cjs',
    banner: '`',
    footer: '`',
    file: 'lib/main.coffee',
  },
  plugins: [
    babel(babelrc()),
    nodeResolve({
      jsnext: true,
    }),
    cleanup(),
  ],
};
