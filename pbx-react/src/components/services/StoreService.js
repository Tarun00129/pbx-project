import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Store from 'src/stores/store.js';
import getStoreClasses from 'src/config/stores';

class StoreService extends Component {
    static propTypes = { children: PropTypes.node };

    static defaultProps = { children: null };

    /**
     * Using context to share data/methods to all other components
     * under this Component's sub-tree.
     */
    static Context = React.createContext();

    constructor(props) {
        super(props);

        const queryParams = new URLSearchParams(window.location.search);

        const storeClasses = getStoreClasses();

        this.store         = new Store(queryParams.has('auth_token') ? queryParams.get('auth_token') : null);
        this.stores        = {};

        Object.keys(storeClasses).map(key => {
            this.stores[key] = new storeClasses[key](this.store);
        });
        this.defaultContext = {
            store:  this.store,  // Store instance
            stores: this.stores, // Stores instance
        };
        /**
         * The context object should always point to the same object ref.
         * Otherwise it will re-render the whole app.
         * @see https://reactjs.org/docs/context.html#caveats
         */
        this.state          = {
            context: {
                ...this.defaultContext
            }
        };
    }

    render() {
        return (
            <StoreService.Context.Provider
                value={this.state.context}
            >
                {this.props.children}
            </StoreService.Context.Provider>
        );
    }
}

StoreService.Provider = StoreService;
StoreService.Consumer = StoreService.Context.Consumer;

export default StoreService;
