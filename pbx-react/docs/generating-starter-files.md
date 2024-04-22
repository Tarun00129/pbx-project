# Generating Starter Files

Use `yarn generate` to create start files using [plop](https://github.com/amwmedia/plop).

## generate

```bash
yarn generate
# or
yarn g
```

This will start an interactive prompt for creating new files.

Optionally, you can bypass right to each generate command, see below commands.

The `<name>` parameters are optional and can be omitted.

## generate component <name>

```bash
yarn generate component <name>
```

Generates a component js, scss and md files.

## generate store <name>

```bash
yarn generate store <name>
```

Generates a store js file, and updates [stores.js](./../src/config/stores.js) with the newly created file.

## generate route <name>

```bash
yarn generate route <name>
```

1. Generates a component from the component generator.
2. Generates a stateless component with the "Route" suffix, rendering the component generated from the previous step.
3. Updates App.js to render the new route.
4. Updates route-paths.js with the new route.
