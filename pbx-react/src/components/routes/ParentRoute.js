import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import withStores from 'src/components/hoc/withStores';
import withTranslation from 'src/components/hoc/withTranslation';
import BaseComponent from 'src/components/BaseComponent/BaseComponent';
import flowRight from 'lodash.flowright';

/**
 * ParentRoute exists *above* all routes. It will not mount/unmount
 * when transitioning between routes.
 *
 * It doesn't render anything itself, but set ups the configuration for the site,
 * by fetching the static config (which contains langs, features, etc). It doesn't
 * even handle rendering the loading and error state of fetching the config, and
 * just sets those up as context variables for child components to hook into and use
 * (which they should, since we need that before showing basically anything).
 *
 * @see config/routes.js
 */
class ParentRoute extends BaseComponent {

    static propTypes = {
        stores: PropTypes.object.isRequired,
        i18n: PropTypes.object.isRequired,
    };

    static defaultProps = {
    };

    static Context = React.createContext();

    constructor(props) {

        super(props);

        // Sets default, currentState and state.
        this.initializeState({
            context: {
                isLoading: true,
                hasError: false,
            },
        });

    }

    componentDidMount() {
        this.updateState({
            context: {
                isLoading: {
                    $set: false,
                },
            },
        })
    }

    handleFetchConfigError = () => {
        this.updateState({
            context: {
                hasError: {
                    $set: true,
                },
            },
        });
    };

    handleInlineErrorClick = () => {
        this.updateState({
            context: {
                isLoading: {
                    $set: true,
                },
                hasError: {
                    $set: false,
                },
            },
        });
    };

    render() {

        return (

            <ParentRoute.Context.Provider
                value={this.state.context}
            >

                {/* Render all of this route's children routes */}
                <Outlet />

            </ParentRoute.Context.Provider>

        );

    }

}

ParentRoute.Provider = flowRight(
    withStores,
    withTranslation,
)(ParentRoute);
ParentRoute.Consumer = ParentRoute.Context.Consumer;

export default ParentRoute;
