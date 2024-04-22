import React from 'react';
import PropTypes from 'prop-types';
import flowRight from 'lodash.flowright';
import 'src/i18n.js';
// eslint-disable-next-line import/no-unresolved
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import  withTranslation  from 'src/components/hoc/withTranslation';
import AppServices from 'src/components/services/AppServices';
import ErrorBoundary from 'src/components/common/ErrorBoundary/ErrorBoundary';
import App from 'src/components/App/App/App';

const propTypes = {
    i18n:   PropTypes.object,
    t:      PropTypes.func,
};

i18n
    .use(initReactI18next)
    .init({
        // ... options
    })
;

const defaultProps = {
    i18n: null,
    t:    (translationKey = '') => translationKey,
};

const AppContainer = props => {
    return (
        <I18nextProvider
            i18n={props.i18n}
        >
            <ErrorBoundary>
                <AppServices.Provider
                    i18n={props.i18n}
                >
                    <App {...props} />
                </AppServices.Provider>
            </ErrorBoundary>
        </I18nextProvider>
    );
};

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes    = propTypes;

export default flowRight(
    withTranslation,
)(AppContainer);
