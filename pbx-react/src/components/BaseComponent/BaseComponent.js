import { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

class BaseComponent extends Component {

    static propTypes = {
        t: PropTypes.func,
        i18n: PropTypes.object,
    };

    static defaultProps = {
        t: (translationKey = '') => translationKey,
        i18n: {},
    };

    constructor(props) {
        super(props);

        // Default state
        this.defaultState = {};
        // Current State (for synchronous writes)
        this.currentState = { ...this.defaultState };
        // React State
        this.state        = { ...this.currentState };
    }

    /**
     * setTranslationPrefix:
     *
     * Adds support for re-usable translation prefixes in class
     * components.
     *
     * @example ```
     *     import BaseComponent from src/components/BaseComponent/BaseComponent';
     *
     *     class MyComponent extends BaseComponent {
     *         constructor(props) {
     *
     *             super(props);
     *
     *             const { t } = this.setTranslationPrefix('components.MyComponent');
     *             this.t = t;
     *
     *         }
     *
     *         render() {
     *             return (
     *                 t('header'); // uses translation key components.MyComponent.header
     *             )
     *         }
     *     }
     * ```
     */
    setTranslationPrefix = translationPrefix => {

        /**
         * getTranslationPrefix():
         *
         * (Getter) returns translationPrefix.
         *
         * @return string
         */
        const getTranslationPrefix = () => {
            return translationPrefix;
        };

        /**
         * getTranslationKey():
         *
         * Takes a translation suffix, appends it to the translationPrefix
         * setting and returns the resulting translation key
         *
         * This function is useful when using the
         * <Trans i18nKey="..."> component
         *
         * @return string
         */
        const getTranslationKey = translationSuffix => {
            const dot = translationPrefix.length > 0 ? '.' : '';
            return `${getTranslationPrefix()}${dot}${translationSuffix}`;
        };

        /**
         * t():
         *
         * Takes a translation suffix, appends it to the translationPrefix
         * setting and returns the translated string.
         *
         * This works just like this.props.t except the prefix is
         * automatically prepended to the translation key.
         *
         * @return string
         */
        const t = (translationSuffix, ...rest) => {
            const translationKey = getTranslationKey(translationSuffix);
            if ('t' in this.props && typeof this.props.t === 'function') {
                return this.props.t(translationKey, ...rest);
            }
            return translationKey;
        };

        /**
         * i18n: also provide access to the i18n object
         */
        const i18n = ('i18n' in this.props) ? this.props.i18n : null;

        return {
            getTranslationPrefix: getTranslationPrefix,
            getTranslationKey:    getTranslationKey,
            t:                    t,
            i18n:                 i18n,
        };
    };

    /**
     * initializeState():
     *
     * Sets all of this.state, this.currentState, this.defaultState.
     *
     * Only use this function in the constructor() as it mutates this.state
     * directly.
     *
     * @example
     *
     *    this.initializeState({
     *        hello: 'world',
     *        foo: {
     *            bar: 'baz',
     *        },
     *    });
     *
     */
    initializeState = (updater = {}) => {
        this.defaultState = {
            ...updater
        };
        this.currentState = {
            ...this.defaultState,
        };
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state = {
            ...this.currentState,
        };
    };

    /**
     * setState():
     *
     * `setState` wrapper which automatically updates currentState, along with
     * state.
     */
    setState = (updater, ...rest) => {
        // If updater is a callback, simply use React's setState without any
        // intervention.
        if (typeof updater === 'function') {
            return super.setState(updater, ...rest);
        }
        // @see https://github.com/facebook/react/blob/master/packages/react/src/ReactBaseClasses.js#L57
        if (typeof updater === 'object') {
            this.currentState = {
                ...this.currentState,
                ...updater,
            };
            return super.setState(updater, ...rest);
        }
        if (typeof updater !== 'undefined') {
            return super.setState(updater, ...rest);
        }
    };

    /**
     * (Utility) Update state.
     *
     * Updates this.currentState and this.state (via this.setState)
     *
     * - this.currentState will be updated synchronously (immediately). This
     *   means the data can be safely read-from immediately after it being
     *   set.
     * - this.state will be updated using react's setState which runs
     *   asynchronously. this.state may not be reliable for reads outside of
     *   the render function.
     *
     * @see https://github.com/kolodny/immutability-helper#update
     * @example this.updateState({ isValid: { $set: true } });
     * @param immutabilityHelperUpdateParam - immutability-helper update param
     * @param setAsDefault - Sets defaultState as well iff true
     */
    updateState = (immutabilityHelperUpdateParam, setAsDefault = false) => {
        this.currentState = update(this.currentState, immutabilityHelperUpdateParam);
        this.defaultState = setAsDefault === true ? update(this.currentState, immutabilityHelperUpdateParam) : this.defaultState;
        super.setState({ ...this.currentState });
    };
}

export default BaseComponent;
