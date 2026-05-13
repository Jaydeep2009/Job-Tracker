import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default[
    {
        input: 'background.js',
        output:{
            file:'dist/background.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
    {
        input:'content-linkedin.js',
        output:{
            file:'dist/content-linkedin.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
    {
        input:'content-naukri.js',
        output:{
            file:'dist/content-naukri.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
    {
        input:'config.js',
        output:{
            file:'dist/config.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
    {
        input:'popup.js',
        output:{
            file:'dist/popup.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
    {
        input:'settings.js',
        output:{
            file:'dist/settings.js',
            format:'iife'
        },
        plugins:[resolve(), commonjs()]
    },
]
