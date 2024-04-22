import withContext from 'src/components/hoc/withContext';
import ParentRoute from 'src/components/routes/ParentRoute';

/**
 * A Higher-Order-Component used to inject parent route context into components
 */
const withParentRoute = WrappedComponent => withContext({
    Component:         WrappedComponent,
    Consumer:          ParentRoute.Consumer,
    mapContextToProps: context => ({
        parentContext: context,
    }),
});

export default withParentRoute;
