// This file is the generator code for plop.
// NOTE: all paths are based on the location of the plopfile

export default {
    description: 'Add component with all boilerplate files (js, scss, etc)',
    prompts: [
        {
            type: 'input',
            name: 'componentName',
            message: 'What should it be called? Use spaces for separation (eg: foo bar)',
            validate: (value) => {
                if (!value.trim()) {
                    return 'The component name is required';
                }

                return true;
            },
        },
        {
            type: 'confirm',
            name: 'isStateless',
            message: 'Do you want the component to be stateless?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'hasStoresProps',
            message: 'Do you want the component to include the stores prop? (allows access to store classes for api)',
            default: false,
        },
        {
            type: 'confirm',
            name: 'hasTranslationProp',
            message: 'Do you want the component to include the "t" prop? (used for translations)',
            default: true,
        },
        {
            type: 'confirm',
            name: 'hasTranslationPrefix',
            message: 'Do you want the component to use translation prefixes? (auto-prefixes translation keys)',
            default: true,
            when: (answers = {}) => answers.hasTranslationProp && answers.isStateless,
        },
    ],
    actions: (data) => {
        return [
            // Generates js file
            {
                type:         'add',
                path:         './src/components/{{pascalCase componentName}}/{{pascalCase componentName}}.js',
                templateFile: `./generators/component/${data.isStateless ? 'component-stateless.js.hbs' : 'component.js.hbs'}`,
                abortOnFail:  true,
                skipIfExists: true,
            },
            // Generate scss file
            {
                type:         'add',
                path:         './src/components/{{pascalCase componentName}}/{{pascalCase componentName}}.scss',
                templateFile: './generators/component/component.scss.hbs',
                abortOnFail:  false,
                skipIfExists: true,
            },
            {
                type:         'append',
                path:         './src/assets/locales/en/translation.json',
                pattern:      '"components": {',
                template:     '\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020"{{pascalCase componentName}}": {\n\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020},',
                abortOnFail:  true,
                skipIfExists: true,
            },
        ];
    },
};
