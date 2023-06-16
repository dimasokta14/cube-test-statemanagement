import { readdirSync } from 'fs';
import path from 'path';
import babel from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from '@rollup/plugin-terser'
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');


const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];
const CODES = [
  'THIS_IS_UNDEFINED',
  'MISSING_GLOBAL_NAME',
  'CIRCULAR_DEPENDENCY',
];

const getChunks = URI =>
  readdirSync(path.resolve(URI))
    .filter(x => x.includes('.ts'))
    .reduce((a, c) => ({ ...a, [c.replace('.ts', '')]: `src/${c}` }), {});

const discardWarning = warning => {
  if (CODES.includes(warning.code)) {
    return;
  }

  console.error(warning);
};

const commonPlugins = () => [
  external({
        includeDependencies: true,
      }),
      babel({
        babelrc: false,
        presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react'],
        extensions: EXTENSIONS,
        exclude: 'node_modules/**',
      }),
      commonjs({
        include: /node_modules/,
      }),
      // replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
      resolve({
        extensions: EXTENSIONS,
        preferBuiltins: false,
      }),
    ];

export default [
  {
    onwarn: discardWarning,
    input: "src/index.ts",
    output: {
      esModule: false,
      file: packageJson.unpkg,
      format: 'umd',
      name: '@dimasokta14/cube-test-statemanagement',
      exports: 'named',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    plugins: [
      ...commonPlugins(),
      typescript({ tsconfig: "./tsconfig.json" }),
      dts(),
      // terser()
    ],
  },
  {
    onwarn: discardWarning,
    input: getChunks('src'),
    output: [
      { dir: 'dist/esm', format: 'esm', sourcemap: true },
      { dir: 'dist/cjs', format: 'cjs', exports: 'named', sourcemap: true },
    ],
    plugins: [...commonPlugins(), dts()],
    // external: ["react", "react-dom"]
  },
];