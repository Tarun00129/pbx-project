// This file is the generator code for plop.
// NOTE: all paths are based on the location of the plopfile

import fs from 'node:fs';
import path from 'node:path';
import changeCase from 'change-case';

export default {
    description: 'Add "withTranslation" HOC to an existing component.',
    prompts: [
        {
            type: 'input',
            name: 'componentName',
            message: 'Component name to update? (input will be converted to PascalCase)',
            validate: (value) => {
                const componentFile = path.resolve(__dirname, '../../src/components/', changeCase.pascalCase(value), `${changeCase.pascalCase(value)}.js`);

                if (!fs.existsSync(componentFile)) {
                    return 'Component file does not exist: ' + componentFile;
                }

                return true;
            },
        },
    ],
    actions: (data) => {

        const path = './src/components/{{pascalCase componentName}}/{{pascalCase componentName}}.js';

        return [
            // Add withTranslation
            {
                type: 'append',
                path: path,
                pattern: 'import React from \'react\';', // add after react import.
                template: 'import withTranslation from \'Hoc/withTranslation\';',
                abortOnFail: false,
            },
            // Add withTranslation
            {
                type: 'append',
                path: path,
                pattern: 'import React, { Component } from \'react\';', // add after react import with deconstructed component.
                template: 'import withTranslation from \'Hoc/withTranslation\';',
                abortOnFail: false,
            },
            // Add "t" proptype for stateless components
            {
                type: 'append',
                path: path,
                pattern: 'const propTypes = {',
                template: '\u0020\u0020\u0020\u0020t: PropTypes.func,',
                abortOnFail: false,
            },
            // Add "t" proptype for class components
            {
                type: 'append',
                path: path,
                pattern: 'static propTypes = {',
                template: '\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020t: PropTypes.func,',
                abortOnFail: false,
            },
            // Add default "t" prop for stateless components
            {
                type: 'append',
                path: path,
                pattern: 'const defaultProps = {',
                template: '\u0020\u0020\u0020\u0020t: (translationKey = \'\') => translationKey,',
                abortOnFail: false,
            },
            // Add default "t" prop for class components
            {
                type: 'append',
                path: path,
                pattern: 'static defaultProps = {',
                template: '\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020t: (translationKey = \'\') => translationKey,',
                abortOnFail: false,
            },
            // Update export with "withTranslation" - assuming the export doesn't have any other HOCs.
            {
                type: 'modify',
                path: path,
                pattern: `export default ${changeCase.pascalCase(data.componentName)}`,
                template: 'export default withTranslation({{pascalCase componentName}})',
                abortOnFail: false,
            },
        ];
    },
};
