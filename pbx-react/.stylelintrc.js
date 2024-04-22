// Disabling rules within css: https://github.com/stylelint/stylelint/blob/master/docs/user-guide/ignore-code.md

module.exports = {
    "extends": [
    ],
    "plugins": [
        "stylelint-scss",
        "stylelint-selector-bem-pattern",
    ],
    "customSyntax": "postcss-scss",
    "rules": {
        "plugin/selector-bem-pattern": {
            /**
             * Selectors must follow this BEM syntax:
             * .block
             * .block__element
             * .block--modifier
             */
            "preset": "bem",
        },
        "scss/dimension-no-non-numeric-values": null, // causing error in components/CurriculumsScroller/CurriculumsScroller.scss
        "scss/double-slash-comment-whitespace-inside": null, // disabling until its autofixable
        "scss/no-duplicate-mixins": null,
        "custom-property-empty-line-before": null,
        "declaration-colon-space-after": null,
        "no-descending-specificity": null,
        "indentation": 4,
        "string-quotes": "double",
        "no-duplicate-selectors": true,
        "color-hex-case": "lower",
        "color-hex-length": "long",
        "color-named": "never",
        "selector-no-qualifying-type": true,
        "selector-combinator-space-after": "always",
        "selector-attribute-quotes": "always",
        "selector-attribute-operator-space-before": "never",
        "selector-attribute-operator-space-after": "never",
        "selector-attribute-brackets-space-inside": "never",
        "declaration-block-trailing-semicolon": "always",
        "declaration-no-important": true,
        "declaration-colon-space-before": "never",
        "property-no-vendor-prefix": true,
        "value-no-vendor-prefix": true,
        "number-leading-zero": "never",
        "function-url-quotes": "always",
        "font-weight-notation": "numeric",
        "font-family-name-quotes": "always-where-recommended",
        "comment-whitespace-inside": "always",
        "comment-empty-line-before": "always",
        "at-rule-no-vendor-prefix": true,
        "at-rule-empty-line-before": [
            "always", {
                "except": [
                    "blockless-after-same-name-blockless",
                    "first-nested",
                ],
                "ignore": [
                    "after-comment",
                    "blockless-after-blockless",
                ],
            },
        ],
        "selector-pseudo-element-colon-notation": "double",
        "selector-pseudo-class-parentheses-space-inside": "never",
        "media-feature-range-operator-space-before": "always",
        "media-feature-range-operator-space-after": "always",
        "media-feature-parentheses-space-inside": "never",
        "media-feature-name-no-vendor-prefix": true,
        "media-feature-colon-space-before": "never",
        "media-feature-colon-space-after": "always",

        // new rules in stylelint 14+
        "alpha-value-notation": null,
        "declaration-block-no-redundant-longhand-properties": null,
        "max-line-length": null,
        "color-function-notation": null,
        "shorthand-property-no-redundant-values": null,
        "selector-class-pattern": null,
        "keyframes-name-pattern": null,
        "at-rule-no-unknown": null,
        "scss/at-rule-no-unknown": true,

        // Custom rules
        "scss/dollar-variable-colon-space-after": "at-least-one-space",
        "scss/dollar-variable-colon-space-before": "never",
        "scss/dollar-variable-no-missing-interpolation": true,
        "scss/declaration-nested-properties": "never",
        "scss/no-duplicate-dollar-variables": true,
    },
};
