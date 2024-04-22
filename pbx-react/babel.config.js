const process = require('process');

const isProduction = process.env.NODE_ENV === 'production';
const isTest       = process.env.NODE_ENV === 'test'; // eg jest

module.exports = {
    plugins: [
        '@babel/plugin-syntax-dynamic-import', // https://blog.jscrambler.com/how-to-make-your-app-faster-with-webpack-dynamic-imports/
        [
            '@babel/plugin-proposal-class-properties', {
                loose: true,
            },
        ],
        ...(isProduction ? ['@babel/plugin-transform-react-constant-elements'] : []),
        ...(isProduction ? ['@babel/plugin-transform-react-inline-elements'] : []),
        ...(isProduction ? ['babel-plugin-transform-react-remove-prop-types'] : []),
        ...(isProduction ? ['babel-plugin-transform-react-class-to-function'] : []),
        '@babel/plugin-transform-runtime',
        // see package.json scripts
        ...(('REACT_REFRESH' in process.env) && process.env.REACT_REFRESH === '1' ? ['react-refresh/babel'] : []),
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                // jest throws this error if set to false:
                // 'SyntaxError: Cannot use import statement outside a module'
                modules: isTest ? 'auto' : false,
                corejs: '2',
                loose: true,
            },
        ],
        [
            '@babel/preset-react',
            {
                development: !isProduction,
            },
        ],
    ],
};
