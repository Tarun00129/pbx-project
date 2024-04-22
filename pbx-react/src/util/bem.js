/* eslint-disable id-length */

/**
 * bem.js:
 *
 * Provides functions / utilities for generating BEM className strings
 *
 * Allows you to build single BEM classes as well as generate multiple classes
 * using one module ('src/util/bem')
 *
 * 1. classname      - Generates a single classname in the BEM format.
 * @see https://github.com/bem/bem-react/tree/master/packages/classname
 *
 *
 * 2. classnames|cns - This is just the 'classnames' library that most are
 *                     already familiar with. Useful for generating lists
 *                     of classes and adding conditions.
 * @see (classnames|cns) https://github.com/JedWatson/classnames
 *
 * @example ```
 *  import { classname, cns } from 'src/util/bem';
 *
 *  // classname
 *  // ----------------------------------
 *  const cn = classname('block');
 *  cn()                             // -> 'block'
 *  cn('elem')                       // -> 'block__elem'
 *  cn('elem')                       // -> 'block__elem'
 *  cn('elem', { mod: false })       // -> 'block__elem'
 *  cn('elem', { mod: true })        // -> 'block__elem block__elem--mod'
 *  cn('elem', { color: 'red' })     // -> 'block__elem block__elem--color-red'
 *
 *  // classnames/cns
 *  // ----------------------------------
 *  cns(
 *      cn(),
 *      'another-block',
 *      { 'conditional-block': true }
 *  )
 *  //  -> 'block another-block conditional-block'
 *
 * ```
 */
import { withNaming } from '@bem-react/classname';
import classnames from 'classnames';

// @see https://github.com/bem/bem-react/tree/master/packages/classname
// @see https://github.com/bem/bem-react/blob/master/packages/classname/classname.tsx
const classname = withNaming({
    n: '',    // Global namespace (prefixes all classes)
    e: '__',  // Element delimiter
    m: '--',  // Modifier delimiter
    v: '-'    // Modifier value delimiter
});

/**
 * classnameWithArraySupport:
 *
 * Adds array support to classname(). Falsy items are ignored.
 * Does not alter or modify any existing 'classname' functionality
 *
 * @example ```
 *    import { classnames, classname } from 'src/util/bem';
 *    let cn = classname(['foo', 'baz', '', undefined, null])
 *    cn('elem') -> ['foo__elem', 'baz_elem']
 * ```
 * @param string[] strArr
 */
const classnameWithArraySupport = (block, ...rest) => {
    if (!Array.isArray(block)) {
        return classname(block, ...rest);
    }
    let classNameArray = block
        .filter(item => item)
        .map(item => classname(...(Array.isArray(item) ? item : [item])))
    ;
    return (...params) => classnames(classNameArray.map(cn => cn(...params)));
};

export { classnameWithArraySupport as classname, classnames };

// Shortform
export { classnames as cns };
