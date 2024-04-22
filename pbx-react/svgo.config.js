/**
 * @see https://github.com/svg/svgo#configuration
 *
 * This is used by @svgr/webpack
 */
module.exports = {
    plugins: [
        {
            name: "preset-default",
            params: {
                overrides: {
                    mergePaths: false,
                    removeUnknownsAndDefaults: {
                        keepDataAttrs: false, // removes data attributes.
                    },
                },
            },
        },
        "prefixIds", // svgr/webpack enables this by default.
        "removeStyleElement",
        "removeTitle",
        {
            name: "removeAttrs",
            params: {
                attrs: [
                    // Remove class attributes to remove styling. We will style svgs ourselves.
                    "class",
                    "fill",
                    "style",
                ],
            },
        },
    ],
};
