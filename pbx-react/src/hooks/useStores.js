import { useContext } from 'react';
import StoreService from 'src/components/services/StoreService';

/**
 * A react hook to get stores and the store object into components.
 *
 * Example usage:
 *
 * ```
 * import useStores from 'src/hooks/useStores';
 *
 * const [stores, store] = useStores();
 *
 * stores.leaderboardsStore.getLeaderboards()
 *      .then(() => {
 *          // code
 *      })
 * ;
 * ```
 *
 * @returns {[Object, Store]}
 */
const useStores = () => {

    const storeServiceContext = useContext(StoreService.Context);

    return [storeServiceContext.stores, storeServiceContext.store];

};

export default useStores;
