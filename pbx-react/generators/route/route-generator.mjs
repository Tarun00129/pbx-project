// This file is the generator code for plop.
// NOTE: all paths are based on the location of the plopfile

import componentGenerator from './../component/component-generator.mjs';

export default {
    description: 'Add a route',
    prompts: [
        // Same prompts as a component.
       ...componentGenerator.prompts,
    ],
    actions: (data) => {
        return [
            // Run component generator's actions (creates component in components dir, adds scss, etc)
            ...componentGenerator.actions(data),
            // Generates route component in routes directory.
            {
                type:         'add',
                path:         './src/components/routes/{{pascalCase componentName}}Route.js',
                templateFile: './generators/route/route.js.hbs',
                abortOnFail:  true,
            },
            // Update App.js with import at the top
            {
                type:        'append',
                path:        './src/components/App/App/App.js',
                pattern:     '// PLOP: Import routes below',
                template:    'import {{pascalCase componentName}}Route from \'src/components/routes/{{pascalCase componentName}}Route\';',
                abortOnFail: true,
            },
            // Update App with new Route component.
            {
                type:         'append',
                path:         './src/components/App/App/App.js',
                pattern:      '{/* PLOP: Add routes below */}',
                templateFile: './generators/route/route-definition.js.hbs',
                abortOnFail:  true,
                data:         {
                    openingCurly: '{',
                    closingCurly: '}',
                },
            },
            // Update route-paths.js with path
            {
                type:        'append',
                path:        './src/config/route-paths.js',
                pattern:     '// PLOP: Add route paths below',
                template:    '\u0020\u0020\u0020\u0020{{camelCase componentName}}: \'/{{kebabCase componentName}}\',',
                abortOnFail: true,
            },
        ];
    }
};
