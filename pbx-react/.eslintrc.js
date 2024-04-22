const path = require("path"); // eslint-disable-line comma-dangle

module.exports = {
    "parser": "@babel/eslint-parser",
    "env": {
        "browser": true,
        "es6": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:promise/recommended",
        "plugin:react-hooks/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "BUILD_CONFIG": "readonly",
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
        "ecmaVersion": 2018,
        "sourceType": "module",
    },
    "plugins": [
        "react",
        "import",
        "jsx-a11y",
        "promise",
        "proposal",
    ],
    "settings": {
        "react": {
            "createClass": "createReactClass", // Regex for Component Factory to use,
            "pragma": "React",  // Pragma to use, default to "React"
            "version": "detect", // React version. "detect" automatically picks the version you have installed.
        },
        "import/resolver": {
            "webpack": { // lets webpack alias work in imports
                "config": path.resolve("./webpack.config.js"), // eslint-disable-line comma-dangle
            },
        },
    },
    "rules": {
        "react/no-multi-comp": [
            "error",
            {
                "ignoreStateless": true,
            },
        ],
        "promise/catch-or-return": [
            "error",
            {
                "terminationMethod": [
                    "catch",
                    "asCallback",
                    "finally",
                ],
            },
        ],
        "promise/always-return": "off",
        "proposal/class-property-space-infix-ops": [
            "error",
            "always",
        ],
        "proposal/class-property-semi": [
            "error",
            "always",
        ],
        "proposal/class-property-no-extra-semi": [
            "error",
        ],
        "proposal/class-property-no-semi-spacing": [
            "error",
        ],
        "proposal/class-property-no-dupe-property": [
            "error",
        ],
        "react-hooks/exhaustive-deps": "error",
        "jsx-quotes": [
            "error",
            "prefer-double",
        ],
        /**
         * react/* from eslint-plugin-react
         */
        "react/boolean-prop-naming": [
            "error",
            {
                // https://github.com/yannickcr/eslint-plugin-react/issues/1551
                "rule": "^(is|has)[A-Z]([A-Za-z0-9]?)+",
                "message": "Prop ({{ propName }}) must be a isser or hasser. Eg: isAuthor, hasChildren",
            },
        ],
        "react/button-has-type": [
            "error",
        ],
        "react/default-props-match-prop-types": [
            "error",
        ],
        "react/no-access-state-in-setstate": [
            "error",
        ],
        "react/no-array-index-key": [
            "error",
        ],
        "react/no-children-prop": [
            "error",
        ],
        "react/no-danger": [
            "error",
        ],
        "react/no-danger-with-children": [
            "error",
        ],
        "react/no-deprecated": [
            "error",
        ],
        "react/no-did-mount-set-state": [
            "error",
        ],
        "react/no-did-update-set-state": [
            "error",
        ],
        "react/no-direct-mutation-state": [
            "error",
        ],
        "react/no-find-dom-node": [
            "error",
        ],
        "react/no-is-mounted": [
            "error",
        ],
        "react/no-redundant-should-component-update": [
            "error",
        ],
        "react/no-render-return-value": [
            "error",
        ],
        "react/no-typos": [
            "error",
        ],
        "react/no-string-refs": [
            "error",
        ],
        "react/no-this-in-sfc": [
            "error",
        ],
        "react/no-unescaped-entities": [
            "error",
        ],
        "react/no-unknown-property": [
            "error",
        ],
        "react/no-unsafe": [
            "error",
        ],
        "react/no-unused-prop-types": [
            "error",
        ],
        "react/no-unused-state": [
            "error",
        ],
        "react/no-will-update-set-state": [
            "error",
        ],
        "react/prefer-es6-class": [
            "error",
        ],
        "react/prefer-stateless-function": [
            "error",
        ],
        "react/prop-types": [
            "error",
        ],
        "react/react-in-jsx-scope": [
            "error",
        ],
        "react/require-default-props": [
            "error",
        ],
        "react/require-render-return": [
            "error",
        ],
        "react/self-closing-comp": [
            "error",
        ],
        "react/style-prop-object": [
            "error",
        ],
        "react/void-dom-elements-no-children": [
            "error",
        ],

        /**
         * react/jsx-* from eslint-plugin-react
         */
        "react/jsx-child-element-spacing": [
            "error",
        ],
        "react/jsx-closing-bracket-location": [
            "error",
            {
                "nonEmpty": "line-aligned",
                "selfClosing": "line-aligned",
            },
        ],
        "react/jsx-closing-tag-location": [
            "error",
        ],
        "react/jsx-curly-spacing": [
            "error",
        ],
        "react/jsx-equals-spacing": [
            "error",
        ],
        "react/jsx-first-prop-new-line": [
            "error",
            "multiline",
        ],
        "react/jsx-handler-names": [
            "error",
        ],
        "react/jsx-indent": [
            "error",
        ],
        "react/jsx-indent-props": [
            "error",
        ],
        "react/jsx-key": [
            "error",
        ],
        "react/jsx-max-props-per-line": [
            "error",
            {
                "maximum": 1,
                "when": "multiline",
            },
        ],
        "react/jsx-no-bind": [
            "error",
        ],
        "react/jsx-no-comment-textnodes": [
            "error",
        ],
        "react/jsx-no-duplicate-props": [
            "error",
        ],
        // For translations/i18n
        // "react/jsx-no-literals": [
        //     "error",
        // ],
        "react/jsx-no-target-blank": [
            "error",
        ],
        "react/jsx-no-undef": [
            "error",
        ],
        "react/jsx-fragments": [
            "error",
            "element",
        ],
        "react/jsx-pascal-case": [
            "error",
        ],
        "react/jsx-props-no-multi-spaces": [
            "error",
        ],
        "react/jsx-tag-spacing": [
            "error",
            {
                "closingSlash": "never",
                "beforeSelfClosing": "always",
                "afterOpening": "never",
                "beforeClosing": "never",
            },
        ],
        "react/jsx-uses-react": [
            "error",
        ],
        "react/jsx-uses-vars": [
            "error",
        ],
        "react/jsx-wrap-multilines": [
            "error",
            {
                "declaration": "parens-new-line",
                "assignment": "parens-new-line",
                "return": "parens-new-line",
                "arrow": "parens-new-line",
                "condition": "parens-new-line",
                "logical": "parens-new-line",
                "prop": "parens-new-line",
            },
        ],
    },
    "overrides": [
        {
            "files": [
                "webpack.config.js",
                "babel.config.js",
            ],
            "env": {
                "node": true,
            },
        },
        {
            "files": [
                ".eslintrc.js",
                ".stylelintrc.js",
                "jest.config.js",
                "svgo.config.js",
            ],
            "env": {
                "node": true,
            },
            "rules": {
                "quotes": [
                    "error",
                    "double",
                ],
            },
        },
    ],
};
