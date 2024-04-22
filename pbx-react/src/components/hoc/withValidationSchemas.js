import withContext from 'src/components/hoc/withContext';
import AppServices from 'src/components/services/AppServices';

/*
 * A Higher-Order-Component used to inject validation schemas into
 * components.
 *
 * @see src/components/services/AppServices.js
 */
const withValidationSchemas = WrappedComponent => withContext({
    Component:         WrappedComponent,
    Consumer:          AppServices.Consumer,
    mapContextToProps: context => ({
        validationSchemas: context.validationSchemas,
    }),
});

export default withValidationSchemas;
