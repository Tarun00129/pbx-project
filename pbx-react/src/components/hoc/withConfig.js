import withContext from 'src/components/hoc/withContext';
import AppServices from 'src/components/services/AppServices';

/*
 * HOC for injecting layout context into your components. Layout context
 * gives you the ability to control and interact with the app-wide layout
 * state
 *
 * @example
 *  `
 *      import withConfig from '<path_to>/withConfig.js';
 *      class Foo extends React.Component {
 *        ...
 *      }
 *      export default withConfig(Foo)
 *  `
 *
 *  Layout context will then be injected and available in your component via
 *  `this.props.config`
 *
 */
const withConfig = WrappedComponent => withContext({
    Component:         WrappedComponent,
    Consumer:          AppServices.Consumer,
    mapContextToProps: context => ({
        config: context.config
    })
});

export default withConfig;
