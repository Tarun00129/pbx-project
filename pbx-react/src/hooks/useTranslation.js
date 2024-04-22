import { useTranslation as reactI18nextUseTranslation } from 'react-i18next';

/**
 * A react hook to get translation tools into components.
 *
 * Example usage:
 *
 * ```
 * import useTranslation from 'src/hooks/useTranslation';
 *
 * const [t, i18n] = useTranslation();
 *
 * t('components.MyComponent.expiredMessage');
 * ```
 *
 * @returns {[Function, Object]}
 */
const useTranslation = () => {

    return reactI18nextUseTranslation();

};

export default useTranslation;
