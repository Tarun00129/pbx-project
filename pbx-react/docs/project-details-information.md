# Project Details / Information

Webpack watches and builds files from the `./src` directory into the `./dist` directory. There is no sense in adding any
files to the `./dist` directory manually since webpack clears out that directory before every build. If you want a file
to be included in the build. You should `import` it in JS, or `url()` it in CSS or use some other avenue provided by the
webpack setup.

## Built-time Injected Config Variables

Webpack has the ability to inject variables into the app at build-time. These variables will be available as globals in
Javascript throughout the app.

See `webpack.config.js` @ `injectBuildVariables`

Example:

```javascript
// FooComponent.js
console.log(BUILD_CONFIG); // -> { environment: 'dev', ...etc }
```
