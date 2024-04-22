/* eslint-disable indent */

const path                        = require('path');
const Encore                      = require('@symfony/webpack-encore');
const HtmlWebpackPlugin           = require('html-webpack-plugin');
// const StyleLintPlugin             = require('stylelint-webpack-plugin');
const CircularDependencyPlugin    = require('circular-dependency-plugin');
const dotenv                      = require('dotenv');
const WebpackBar                  = require('webpackbar');
const WebpackShellPluginNext      = require('webpack-shell-plugin-next');
const DeadCodePlugin              = require('webpack-deadcode-plugin');
const ReactRefreshWebpackPlugin   = require('@pmmmwh/react-refresh-webpack-plugin');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

const isCI = process.env.CI;

if (!isCI) {
    /**
     * DotEnv:
     *
     * Populates process.env with config's environment.env, so we can use
     * it in webpack here.
     */
    dotenv.config({
        path: path.resolve(
            __dirname,
            '.env'
        )
    });
}

/**
 * Environment variables
 *
 * @type {Object}
 */
// eslint-disable-next-line no-unused-vars
const environmentVars = {};

/**
 * Html <title> used in HtmlWebpackPlugin
 */
const title = 'PBX';

/**
 * Project root dir path
 */
const projectRootDirPath = path.resolve(
    __dirname
);

/**
 * Src: Dir path
 */
const srcDirPath = path.resolve(
    projectRootDirPath,
    'src'
);

/**
 * Src: Entry point file path
 */
const srcEntryFilePath = path.resolve(
    srcDirPath,
    'index.js'
);

/**
 * Src: Template file path
 */
const srcTemplateFilePath = path.resolve(
    srcDirPath,
    'index.html'
);

/**
 * Src: Exclude (blacklist) paths
 */
const srcExclude = /(node_modules|bower_components)/;

/**
 * Dist Build: Build destination dir path. Target dir for webpack output.
 */
const distBuildDirPath = path.resolve(
    projectRootDirPath,
    'dist-build'
);

/**
 * Dist Tmp: Dist temporary folder. For deploying with minimal downtime.
 *           dist-build gets copied to it after build completes.
 */
const distTmpDirPath = path.resolve(
    projectRootDirPath,
    'dist-tmp'
);

/**
 * Dist Web: Dist web root. Directory served by apache.
 */
const distWebDirPath = path.resolve(
    projectRootDirPath,
    'dist'
);

/**
 * Dist: Output template filename
 */
const distTemplateFileName = 'index.html';

/**
 * Base path from which other path's are (or can be) built upon.
 */
const basePath = '';

/**
 * From the docs:
 *
 *   - Simple rule: This is the URL to output.path from the view of the
 *     HTML page.
 *   - The value of the option is prefixed to every URL created by the
 *     runtime or loaders. Because of this the value of this option ends
 *     with '/' in most cases.
 *
 * @see https://webpack.js.org/configuration/output#outputpublicpath
 */
const publicPath = `${basePath}/`;

/**
 * Url path to the Auth API.
 */
const apiUrlPath = '/api';

/**
 * Url path to login (simple saml repo, usually this is the "conduit-sso" repository)
 */
const loginUrlPath = '/login';

/**
 * Url path to the app
 */
const appUrlPath = '/';

/**
 * Enable Hot Module Reloading? This affects numerous config options.
 * Typically, requires 'webpack-dev-server' to function.
 *
 * @see https://webpack.js.org/concepts/hot-module-replacement
 */
const isHotModuleReloadingEnabled = Encore.isDevServer();

/**
 * Webpack Dev Server port. Use an open port.
 *
 * @see https://webpack.js.org/configuration/dev-server#devserverport
 */
const devServerPort = 9001;

/**
 * Webpack Dev Server Proxy:
 * Proxy dev server urls to other hosts. Useful for proxying API
 * URLs which are served by apache.
 *
 * @see https://webpack.js.org/configuration/dev-server#devserverproxy
 */
const devServerProxy = [
    {
        target: 'http://localhost',
        context: [
            /**
             * This allows accessing the api while running the webpack server:
             *
             * Eg:
             * 192.168.x.x:9001/<project-url-path>/api (webpack server) -> 192.168.x.x/<project-url-path>/api (hosted by apache)
             */
            apiUrlPath,
            /**
             * This allows accessing the "login" while running the webpack server:
             *
             * Eg:
             * 192.168.x.x:9001/login (webpack server) -> 192.168.x.x/login (hosted by apache)
             */
            loginUrlPath,
            /**
             * This allows accessing the App while running the webpack server:
             *
             * Eg:
             * 192.168.x.x:9001 (webpack server) -> 192.168.x.x/dashboard (hosted by apache)
             */
            appUrlPath,
        ],
    }
];

/**
 * List of resolving aliases.
 *
 * Long story short, these can be used to shorten or simplify
 * commonly-used paths when doing 'import's. These can be used in both JS
 * files and Sass files. Using aliases allows us to avoid excessive and
 * hard-to-read use of relative paths (Eg. ../../../Components/Foo).
 * In addition, it allows us to change the project structure with very
 * little effort provided aliases are used for most or all imports.
 *
 * If you are adding a new directory to the project that is going to end
 * up being 'import'ed from a lot, it is suggested to add it here as an
 * alias. And use that alias to reference the directory (instead of the
 * relative or absolute path to the directory).
 *
 * These are not just restricted to directories, aliases can be anything
 * you'd find in an 'import' statement. That includes directories, files,
 * modules and so on.
 *
 * @see https://webpack.js.org/configuration/resolve/#resolvealias
 */
const resolveAliases = {
    src: srcDirPath, // allows `import 'src/dir/file'`
    /**
     * This ensures that when using `npm link` or `yarn link`),
     * webpack uses our project version of react.
     *
     * Without this, we get this error when using yarn link with RCL: https://reactjs.org/docs/error-decoder.html/?invariant=321
     */
    'react': path.resolve(projectRootDirPath, './node_modules/react'),
};

/**
 * List of build-time variables you want to be available to the app.
 * These variables will be hard-coded into the build as global variables.
 * Useful for things like passing whether it's a 'dev' or 'prod' build,
 * dynamically retrieved details about the server, or information about
 * paths and so on. Since this webpack config is running in NodeJS
 * it can also be used for passing server-side information to the
 * client-side. The only thing to be aware of is that these variables are
 * injected at *build-time*. These variables won't be updated unless the
 * project is re-built.
 *
 * @see https://webpack.js.org/plugins/define-plugin
 */
const injectBuildVariables = {
    BUILD_CONFIG: {
        publicPath:                               JSON.stringify(publicPath),
        title:                                    JSON.stringify(title),
        apiUrlPath:                               JSON.stringify(apiUrlPath),
        loginUrlPath:                             JSON.stringify(loginUrlPath),
        appUrlPath:                               JSON.stringify(appUrlPath),
    },
};

Encore
    /**
     * Directory where compiled assets will be stored.
     *
     * Note: dev-server will not run the post-build script, thus can point to the web directory directly.
     * For all other builds, we point to the build directory and after building, the post-build script
     * copies it over to the web directory.
     */
    .setOutputPath(Encore.isDevServer() ? distWebDirPath : distBuildDirPath)
    // public path used by the web server to access the output path
    .setPublicPath(publicPath)
    .setManifestKeyPrefix('dist/')

    /*
     * Entry config
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry('index', [
        // Prepend babel polyfill & any other polyfills
        ...(Encore.isProduction() ? ['@babel/polyfill'] : []),
        srcEntryFilePath,
    ])

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    // TODO: Enable this later!
    // .splitEntryChunks()

    // Disabled because we build a single page application.
    .disableSingleRuntimeChunk()

    .enableSourceMaps(!Encore.isProduction())

    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(!Encore.isDevServer())

    // Disabling will enable style-loader (better for hot reloading?)
    .disableCssExtraction(Encore.isDevServer())

    /**
     * --------------------------------------------------
     * LOADERS / RULES
     *
     * @see https://webpack.js.org/loaders/
     * --------------------------------------------------
     */

    .configureImageRule({}, (rule) => {
        rule.exclude = [
            srcExclude,
            // Exclude inline-svgs, since they have a separate rule (see below).
            path.resolve(srcDirPath, 'assets', 'images', 'inline-svgs'),
        ];
    })

    /**
     * Inline Svgs
     *
     * This will run svgs through svgo and make svgs a react component.
     *
     * @see svgo.config.js
     */
    .addRule({
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/, // only run this loader when js/ts/jsx/tsx files request it.
        include: path.resolve(srcDirPath, 'assets', 'images', 'inline-svgs'),
        exclude: srcExclude,
        use: [
            {
                loader: '@svgr/webpack',
            },
        ],
    })

    // enables Sass/SCSS support
    .enableSassLoader()

    // PostCSS
    .when(Encore.isProduction(), (encore) => encore.enablePostCssLoader())

    /**
     * --------------------------------------------------
     * RESOLVE ALIASES
     *
     * @see https://webpack.js.org/configuration/resolve/#resolve-alias
     * --------------------------------------------------
     */

    .addAliases(resolveAliases)

    /**
     * --------------------------------------------------
     * PLUGINS
     *
     * @see https://webpack.js.org/plugins/
     * --------------------------------------------------
     */

    .cleanupOutputBeforeBuild([
        '**/*',
        '!.gitkeep',
        '!.gitignore'
    ])

    // Uncomment if you want linting while running the dev server.
    // .when(Encore.isDevServer(), (encore) => {
    //     /**
    //      * ESLintPlugin
    //      *
    //      * @see https://github.com/webpack-contrib/eslint-webpack-plugin
    //      */
    //     encore.enableEslintPlugin((options) => {
    //         options.emitWarning          = true; // Recommended if using HMR
    //         options.lintDirtyModulesOnly = true; // Lint only changed files, skip lint on start.
    //     });
    //
    //     /**
    //      * StyleLintPlugin:
    //      *
    //      * @see https://github.com/webpack-contrib/stylelint-webpack-plugin
    //      */
    //     encore.addPlugin(new StyleLintPlugin({
    //         context:              srcDirPath,
    //         emitWarning:          true,
    //         lintDirtyModulesOnly: true, // Lint only changed files, skip lint on start.
    //     }));
    // })

    /**
     * Circular Dependency Plugin: Detects circular dependencies.
     *
     * @see https://github.com/aackerman/circular-dependency-plugin
     */
    .when((Encore.isDev() || Encore.isDevServer() || isCI), (encore) => {
        encore.addPlugin(new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: srcExclude,
            // Add errors to webpack instead of warnings
            failOnError: isCI,
            // allow import cycles that include an asynchronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: projectRootDirPath,
        }));
    })

    /**
     * DeadCode Plugin: Webpack plugin to detect unused files and unused exports in used files.
     *
     * @see https://github.com/MQuy/webpack-deadcode-plugin
     */
    .when((Encore.isDev() || Encore.isDevServer() || isCI), (encore => {
        encore.addPlugin(new DeadCodePlugin({
            log: 'unused',
            failOnHint: isCI, // dev envs will just have warnings
            patterns: [
                'src/**/*.*',
            ],
            exclude: [
                '**/*.(stories|spec|test).(js|jsx)',
                '**/_variables-**.scss',
                '**/hooks/*.js',
                '**/hoc/*.js',
                '**/isValidEmailId.js',
                '**/locales/**/*.*'
            ],
        }));
    }))

    /**
     * Define Plugin: Define variables to be injected into the app
     *
     * @see https://webpack.js.org/plugins/define-plugin
     */
    .configureDefinePlugin((options) => {
        options.BUILD_CONFIG = injectBuildVariables.BUILD_CONFIG;
    })

    /**
     * DevServer:
     *
     * @see https://webpack.js.org/configuration/dev-server#devserver
     */
    .configureDevServerOptions((options) => {
        options.devMiddleware = {
            index: distTemplateFileName,
            stats: 'minimal', // Don't show module build information, clutters up the output.
        };
        options.port =               devServerPort;
        options.host =               '0.0.0.0';
        options.allowedHosts =       'all';
        options.hot =                isHotModuleReloadingEnabled;
        options.historyApiFallback = {
            index: `${publicPath}`,
        };
        // https://webpack.js.org/configuration/dev-server#devserverproxy
        // Proxy the API
        options.proxy = devServerProxy;
    })

    /**
     * HTML Webpack Plugin
     *
     * @see https://webpack.js.org/plugins/html-webpack-plugin
     */
    .addPlugin(new HtmlWebpackPlugin({
        title:    title,
        filename: distTemplateFileName,
        template: srcTemplateFilePath,
        minify:   Encore.isProduction(),
        meta:     {
            'X-UA-Compatible': {
                'http-equiv': 'X-UA-Compatible',
                'content':    'IE=edge'
            },
            'Cache-control':   {
                'http-equiv': 'Cache-control',
                'content':    'no-cache, no-store, must-revalidate'
            },
            'Pragma':          {
                'http-equiv': 'Pragma',
                'content':    'no-cache'
            },
            'charset':         'utf-8',
            'viewport':        'width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, viewport-fit=cover',
        },
    }))

    /**
     * WebpackShellPlugin: Runs shell commands before or after builds
     *
     * @see https://github.com/1337programming/webpack-shell-plugin
     */
    .when(!Encore.isDevServer(), (encore) => {
        const setupDistTmpDirPath = [ // reused set of commands
            `mkdir -p ${distTmpDirPath}`,
            `find ${distTmpDirPath} -mindepth 1 -delete`,
            `touch ${distTmpDirPath}/.gitkeep`,
        ];
        encore.addPlugin(new WebpackShellPluginNext({
            dev: false, // false makes commands run on every build (eg for watch mode)
            onBuildEnd: {
                scripts: [
                    /**
                     * This is to re-build with minimal downtime. Accomplished
                     * by building in a separate (non-web) directory and once
                     * complete, swap the web directory with the newly built one.
                     */

                    // Ensure ${distTmpDirPath} exists, is empty, but has .gitkeep
                    ...setupDistTmpDirPath,

                    // Copy the build dir to the tmp dir
                    `cp -raT ${distBuildDirPath} ${distTmpDirPath}`,

                    // Remove the web dir
                    `rm -r ${distWebDirPath}`,

                    // Move the tmp dir to the web dir to make the updates live.
                    `mv ${distTmpDirPath} ${distWebDirPath}`,

                    // Ensure ${distTmpDirPath} exists, is empty, but has .gitkeep
                    ...setupDistTmpDirPath,
                ],
                blocking: true,
                parallel: false,
            },
        }));
    })

    /**
     * @see https://github.com/unjs/webpackbar
     */
    .when(!Encore.isDevServer(), (encore) => encore.addPlugin(new WebpackBar()))

    .when(isHotModuleReloadingEnabled, (encore) => {
        encore.addPlugin(new ReactRefreshWebpackPlugin());
    })
;

const webpackConfig = Encore.getWebpackConfig();

module.exports = webpackConfig;
