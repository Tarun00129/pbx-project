import React from 'react';
import PropTypes from 'prop-types';
import GenericError from 'src/components/common/GenericError/GenericError';
import { classname } from 'src/util/bem';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {

    static defaultProps = {
    };

    static propTypes = {
        children: PropTypes.node.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error) { /* eslint-disable-line */ // We might use this in future
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true
        };
    }

    // componentDidCatch(error, info) {
    //     // You can also log the error to an error reporting service
    //     // logErrorToMyService(error, info);
    // }

    render() {
        const cn = classname('error-boundary');
        if (this.state.hasError) {
            return (
                <div className={cn()}>
                    <GenericError />
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
