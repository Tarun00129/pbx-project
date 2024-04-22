import { useTranslation } from 'react-i18next';

/**
 * A React hook to provide auto-prefixed translations to functional
 * components.
 *
 * Example usage:
 *
 * ```
 * import useTranslationPrefix from 'src/hooks/useTranslationPrefix';
 *
 * const { t } = useTranslationPrefix(
 *     'components.PostReview'
 * );
 * console.log(t('header')); // -> 'Example Header' (translated)
 * ```
 */
const useTranslationPrefix = (translationPrefix) => {
    return useTranslation(undefined, {
        keyPrefix: translationPrefix,
    });
};

export default useTranslationPrefix;
