
import { createPlugins } from 'rollup-plugin-atomic'

const plugins = createPlugins(['js', ['ts', { tsconfig: './src/tsconfig.json', noEmitOnError: false, module: 'ESNext' }]])

export default [
  {
    input: 'src/main.ts',
    output: [
      {
        dir: 'lib',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    // loaded externally
    external: ['atom', 'cross-spawn', 'sax', 'atom-package-deps', 'net', 'path'],
    plugins,
  },
];
