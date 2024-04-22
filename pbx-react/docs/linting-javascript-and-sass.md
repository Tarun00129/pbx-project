# Linting Javascript and Sass

These commands are specified in [package.json](./../package.json) under the `scripts` key.

Commands specified in package.json can be executed using `yarn run <command-name>`, `npm run <command-name>` or even shorter, `yarn <command-name>`

Learn more about [yarn run](https://yarnpkg.com/lang/en/docs/cli/run/).

## lint

```bash
yarn lint
```

Runs all linters in series.

## lint:eslint

```bash
yarn lint:eslint
# or to fix errors:
yarn lint:eslint:fix
```

Runs eslint to lint javascript files only.

## lint:styles

```bash
yarn lint:styles
# or to fix errors:
yarn lint:styles:fix
```

Runs stylelint to lint sass files only.

## lint:json

```bash
yarn lint:json
```

Lints the en translation.json file for syntax errors.
