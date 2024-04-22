import React from 'react';
import PropTypes from 'prop-types';
import { classname, cns } from 'src/util/bem';
import ErrorGenericSvg from 'src/assets/images/error-generic.svg';
import './GenericError.scss';

const handleTryAgainClick = () => {
    window.location.reload();
};

const defaultProps = {
    className: '',
    style: {},
    headerText: 'Looks Like Something Went Wrong',
    subHeaderText: 'Please try again.',
    onClick: handleTryAgainClick,
};

const propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    headerText: PropTypes.string,
    subHeaderText: PropTypes.string,
    onClick: PropTypes.func,
};

const GenericError = (props) => {
    const cn = classname('generic-error');
    return (
        <div
            className={cns(
                cn(),
                props.className,
            )}
            style={props.style}
        >

            <img
                className={cn('img')}
                src={ErrorGenericSvg}
                alt="Success"
            />

            <h1 className={cn('header')}>
                {props.headerText}
            </h1>

            <p className={cn('sub-header')}>
                {props.subHeaderText}
            </p>

            <section className={cn('btn-container')}>
                <button
                    type="button"
                    onClick={props.onClick}
                    className={cn('btn-try-again')}
                >
                    Try Again
                </button>
            </section>

            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
                href={'#'} // Login URL here
                className={cn('login')}
            >
                Login
            </a>
        </div>
    );
};

GenericError.defaultProps = defaultProps;
GenericError.propTypes    = propTypes;

export default GenericError;
