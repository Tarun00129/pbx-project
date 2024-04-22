// This file is the generator code for plop.
// NOTE: all paths are based on the location of the plopfile

export default {
    description: 'Add a store class file for communicating with the api',
    prompts: [
        {
            type: 'input',
            name: 'storeName',
            message: 'What should it be called? Use spaces for separation (eg: foo bar)',
            validate: (value) => {
                if (!value.trim()) {
                    return 'The store name is required';
                }

                return true;
            },
        },
    ],
    actions: [
        // Create store file class
        {
            type: 'add',
            path: './src/stores/{{pascalCase storeName}}Store.js',
            templateFile: './generators/store/store.js.hbs',
            abortOnFail: true,
        },
        // Update stores.js with import at the top
        {
            type: 'append',
            path: './src/config/stores.js',
            pattern: '// PLOP: Import stores below',
            template: 'import {{pascalCase storeName}}Store from \'Stores/{{pascalCase storeName}}Store\';',
            abortOnFail: true,
        },
        // Add new key/value to stores object
        {
            type: 'append',
            path: './src/config/stores.js',
            pattern: '// PLOP: Add stores below',
            template: '    {{camelCase storeName}}Store: {{pascalCase storeName}}Store,', // 4 spaces for indentation
            abortOnFail: true,
        },
    ],
};
