import withContext from 'src/components/hoc/withContext';
import StoreService from 'src/components/services/StoreService';

/*
 * A Higher-Order-Component used to inject app stores into components
 *
 * @see stores.js
 *
 * @example Inject stores into component using this:
 *
 *          `
 *              import withStores from '<path_to>/withStores.js';
 *              class Foo extends React.Component {
 *                ...
 *              }
 *              export default withStores(Foo)
 *          `
 *
 *          Stores will then be injected and available in your component via
 *          `this.props.stores`
 *
 */
const withStores = WrappedComponent => withContext({
    Component:               WrappedComponent,
    Consumer:                StoreService.Consumer,
    mapContextToProps: context => ({
        stores: context.stores,
    })
});

export default withStores;
