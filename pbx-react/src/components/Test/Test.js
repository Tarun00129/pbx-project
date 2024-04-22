import React from 'react';
import PropTypes from 'prop-types';
import { classname, cns } from 'src/util/bem';

import useTranslationPrefix from 'src/hooks/useTranslationPrefix';
import './Test.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const Test = (props) => {

    const cn = classname('test');

    // You now have access to the 't' (translate) function
    // Delete the console log and these comments before committing!
    const { t } = useTranslationPrefix('components.Test');
    console.log(t('message'));

    return (

        <div
            className={cns(
                cn(),
                props.className,
            )}
        >

            Testing Route!

        </div>

    );

};

Test.defaultProps = defaultProps;
Test.propTypes    = propTypes;

export default Test;
