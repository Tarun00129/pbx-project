/* eslint-env node */

const postcssFlexBugsFixes = require('postcss-flexbugs-fixes');
const autoprefixer         = require('autoprefixer');

module.exports = {
    plugins: [
        autoprefixer({
            cascade: false,
        }),
        postcssFlexBugsFixes,
    ],
};
