import React from 'react';
import Layout from 'src/components/App/Layouts/Layout/Layout';

/**
 * This HOC wraps your component inside the Layout component.
 *
 * Usage:
 * ```
 * import React from 'react';
 * import withLayout from 'src/components/hoc/withLayout';
 *
 * const AwesomeComponent = (props) => {
 *     return (
 *         <div>
 *             I will be rendered inside the panel!
 *         </div>
 *     );
 * };
 *
 * export default withLayout(AwesomeComponent);
 * ```
 *
 * @param {React.ElementType} WrappedComponent
 * @param {object} layoutProps
 *
 * @returns {function(*)}
 */
// eslint-disable-next-line react/display-name
const withLayout = (WrappedComponent, layoutProps = {}) => (props) => {

    return (

        <Layout
            {...layoutProps}
        >

            {(layoutProps) => {

                return (

                    <WrappedComponent
                        {...props}
                        {...layoutProps}
                    />
                );

            }}

        </Layout>

    );

};

export default withLayout;
