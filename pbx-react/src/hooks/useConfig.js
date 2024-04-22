import { useContext } from 'react';
import AppServices from 'src/components/services/AppServices';

/**
 * A react hook to get the global config for app and route paths into a component.
 *
 * Example usage:
 *
 * ```
 * import useConfig from 'src/hooks/useConfig';
 *
 * const config = useConfig();
 *
 * config.app; // app config
 * config.routePaths; // route paths
 * ```
 *
 * @returns {Object}
 */
const useConfig = () => {

    const appServicesContext = useContext(AppServices.Context);

    return appServicesContext.config || {};

};

export default useConfig;
