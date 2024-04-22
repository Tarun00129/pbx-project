/**
 * AppServices: A place to add app-wide services.
 *
 * The purpose of this file is to contain all the App Services which
 * use the Context API to provide data/methods to the entire app.
 *
 * Rather than wrapping/nesting a bunch of context components in the main
 * App component, Context providers can go in here.
 *
 * Additionally, AppServices is a context provider itself, so
 * it can be used for one-off or general-purpose context data/methods.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StoreService from 'src/components/services/StoreService';
import getPasswordSchema from 'src/schemas/password';
import appConfig from 'src/config/app';
import routePaths from 'src/config/route-paths';

class AppServices extends Component {
    static propTypes = {
        i18n: PropTypes.object,
        children: PropTypes.node,
    };

    static defaultProps = {
        children: null,
        i18n: {},
    };

    /**
     * Using context to share data/methods to all other components
     * under the this Component's sub-tree.
     */
    static Context = React.createContext();

    constructor(props) {
        super(props);
        this.defaultContext = {
            config: {
                app: appConfig,
                routePaths: routePaths
            },
            validationSchemas: {
                password: getPasswordSchema(props.i18n),
            },
        };
        this.state = {
            context: {
                ...this.defaultContext
            }
        };
    }

    render() {

        return (

            <AppServices.Context.Provider
                value={this.state.context}
            >

                <StoreService.Provider>
                    {this.props.children}
                </StoreService.Provider>

            </AppServices.Context.Provider>

        );

    }

}

AppServices.Provider = AppServices;
AppServices.Consumer = AppServices.Context.Consumer;

export default AppServices;
