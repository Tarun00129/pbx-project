
/**
 * Main app config.
 *
 * - Copies the external BUILD_CONFIG variable from the webpack config
 *   into `config.buildConfig`
 * - Define & build the rest of the app config.
 *
 * @see webpack.config.js @ BUILD_CONFIG
 *
 * @type {Object}
 */
const config = {
    buildConfig: {
        ...BUILD_CONFIG,
    },
};

config.publicPath           = config.buildConfig.publicPath.replace(/\/$/, ''); // without trailing slash
config.apiUri               = config.buildConfig.apiUrlPath;
config.authApiUrlPath       = config.buildConfig.authApiUrlPath;
config.loginUri             = config.buildConfig.loginUrlPath;
config.appUrlPath           = config.buildConfig.appUrlPath;
config.publicUrl            = config.buildConfig.publicPath;

export default config;
