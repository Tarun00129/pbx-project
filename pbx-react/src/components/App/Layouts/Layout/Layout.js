import React from 'react';
import PropTypes from 'prop-types';
import { classname, cns } from 'src/util/bem';
import './Layout.scss';
import useParentRouteContext from 'src/hooks/useParentRouteContext';

const propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    hasSmallContainer: PropTypes.bool,
};

const defaultProps = {
    children: null,
    className: '',
    hasSmallContainer: false,
};

/**
 * Layout is the new and improved layout! It renders a panel on the right
 * side of the page on large screens, and a centered panel on medium and smaller screens.
 */
const Layout = (props) => {

    const cn = classname('layout');
    const parentRouteContext = useParentRouteContext();

    return (

        <div
            className={cns(
                cn(),
                props.className,
            )}
        >
            <div
                className={cn({
                    'has-small-container': props.hasSmallContainer,
                })}
            >

                <div
                    className={cn('inner', {
                        'has-small-container': props.hasSmallContainer,
                    })}
                >

                    <div
                        className={cn('section-container', {
                            'has-small-container': props.hasSmallContainer
                        })}
                    >

                        {parentRouteContext.hasError ? (

                            // TODO - render error component here
                            <div />

                        ) : parentRouteContext.isLoading ? (

                            // TODO - render loader component here
                            <div />

                        ) : (

                            <React.Fragment>

                                {props.children()}

                            </React.Fragment>

                        )}

                    </div>

                </div>
            </div>

        </div>

    );

};

Layout.defaultProps = defaultProps;
Layout.propTypes = propTypes;

export default Layout;
