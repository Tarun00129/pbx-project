import { useContext } from 'react';
import ParentRoute from 'src/components/routes/ParentRoute';

/**
 * A react hook to get the parent route context into a component.
 *
 * NOTE: Avoid using this if you can, and instead use withConfig, or withCurrentUser for config and user respectively.
 *
 * Example usage:
 *
 * ```
 * import useParentRouteContext from 'src/hooks/useParentRouteContext';
 *
 * const parentRouteContext = useParentRouteContext();
 *
 * parentRouteContext.handleLanguageChange(lang)();
 * ```
 *
 * @returns {Object}
 */
const useParentRouteContext = () => {

    return useContext(ParentRoute.Context);

};

export default useParentRouteContext;
