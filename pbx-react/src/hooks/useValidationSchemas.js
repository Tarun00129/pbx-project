import { useContext } from 'react';
import AppServices from 'src/components/services/AppServices';

/**
 * A react hook to Validation Schema in prop.
 *
 * Example usage:
 *
 * ```
 * import useValidationSchemas from 'src/hooks/useValidationSchemas';
 *
 * const validationSchemas = useValidationSchemas();
 *
 * ```
 *
 * @returns {Object}
 */
const useValidationSchemas = () => {

    const appServicesContext = useContext(AppServices.Context);

    return appServicesContext.validationSchemas || {};

};

export default useValidationSchemas;
