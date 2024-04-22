import i18n from 'i18next'; // eslint-disable-line import/no-unresolved
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * Import all files in the locales directory using webpack's require.context
 * feature. This feature allows for recursively importing files using a regex
 *
 * In this case, all .json files in the 'locales' dir will be imported.
 *
 * @see https://webpack.js.org/guides/dependency-management/#requirecontext
 */
const context = require.context(                  // eslint-disable-line no-undef
    './assets/locales',                           // directory
    true,                                         // includeSubdirs
    /((theme-)?translation|utils|format)\.json$/, // files regexp
    'sync'                                        // mode
);

/**
 * Get all translation files into an object in the form of:
 *
 * @example {
 *     './en-US/translation.json': <file-contents>,
 *     ...
 * }
 */
const translationFiles = {};
context.keys().forEach(key => {
    translationFiles[key] = context(key);
});

/**
 * Format the translation files object into a valid i18next 'resources'
 * object. The resources object can be used to define all the translations.
 */
const resources = {};
Object.entries(translationFiles).forEach(([filePath, translations]) => {
    /* Ignore files in invalid dir structure. */
    if ((filePath.match(/\//g) || []).length !== 2) {
        return;
    }
    /* Parse the languageCode and namespace from the translation file's filePath */
    const languageCode = filePath.substring(0, filePath.lastIndexOf('/')).replace('./', '');
    const namespace    = filePath.substring(filePath.lastIndexOf('/') + 1).replace('.json', '');
    if (!(languageCode in resources)) {
        resources[languageCode] = {};
    }
    resources[languageCode][namespace] = translations;
});

i18n
    .use(LanguageDetector)   // Detect language from user's browser (to start at least)
    .use(initReactI18next)   // passes i18n down to react-i18next
    /**
     * @see https://www.i18next.com/overview/configuration-options
     * @see https://react.i18next.com/latest/using-with-hooks#configure-i-18-next
     * @see https://react.i18next.com/latest/i18next-instance
     * @see https://github.com/i18next/i18next-browser-languageDetector#detector-options
     */
    .init({
        skipOnVariables: false, // false was the default in <v21.x
        /**
         * resources:
         *
         * An object which contains all translations to be passed to i18next.
         *
         * @see https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
         *
         * @example resources object:
         *     ```
         *        resources: {
         *            <Language Code>: {
         *                 <Namespace>: {
         *                     ...translations
         *                 }
         *            }
         *        }
         *     ```
         */
        resources: resources,
        react: {
            useSuspense: false, // Causes error boundary if not disabled
        },
        fallbackLng: 'en',
        // fallbackLng: false,
        cleanCode: true,
        interpolation: {
            escapeValue: false // react already safe from xss
        },
        joinArray: '\n',
        joinArrays: '\n',
        defaultNS: 'theme-translation',
        fallbackNS: 'translation',
        ns: [
            'utils',
            'format',
            'translation',
            'theme-translation'
        ],
        detection: {
            caches: [],
            order: [
                'querystring',
                'navigator',
                'htmlTag',
                'path',
                'subdomain',
            ],
        }
    })
;

export default i18n;
