import minify from 'rollup-plugin-babel-minify';
import pkg from './package.json';

export default [
    {
        input: 'src/main.js',
        name: 'angularRadialColorPicker',
        sourcemap: true,
        output: {
            format: 'umd',
            file: 'dist/color-picker.umd.min.js'
        },
        plugins: [
            minify({
                comments: false
            })
        ]
    },
    {
        input: 'src/main.js',
        name: 'angularRadialColorPicker',
        output: {
            format: 'umd',
            file: pkg.browser
        }
    },
    {
        input: 'src/main.js',
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
];
