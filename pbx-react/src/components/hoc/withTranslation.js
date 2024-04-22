import { withTranslation } from 'react-i18next';

/*
 * A Higher-Order-Component used to inject translation features into components
 *
 * @example Inject stores into component using this:
 *
 *          `
 *              import withTranslation from '<path_to>/withTranslation';
 *
 *              class Foo extends React.Component {
 *                  static propTypes = {
 *                      t: PropTypes.func,
 *                  };
 *
 *                  static defaultProps = {
 *                      t: (translationKey = '') => translationKey,
 *                  };
 *
 *              }
 *              export default withTranslation(Foo);
 *          `
 *
 *          Translation features will then be injected and available in your
 *          component as props. (Eg. this.props.t)
 */

export default WrappedComponent => withTranslation()(WrappedComponent);
