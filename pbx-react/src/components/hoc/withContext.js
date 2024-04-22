import React from 'react';

/**
 * withContext:
 *
 * In order to access Context props in your component(s), you must
 * intentionally "Consume" or "Subscribe" to them.
 *
 * This HOC is intended to make it easy to accept Context data as props.
 *
 * @see https://reactjs.org/docs/context.html
 *
 * @example ```
 *     // NotificationsTester.js
 *
 *     import withContext from 'src/components/hoc/withContext';
 *     import NotificationsService from './NotificationsService';
 *
 *     //  ...Define NotificationsTester component
 *
 *     export default withContext({
 *         Component:               NotificationsTester,
 *         Consumer:                NotificationsService.Consumer
 *         mapContextToProps: context => ({
 *             enqueueNotification: context.enqueueNotification,
 *         })
 *     });
 * ```
 *
 * @param {Object} Component -  The component you want to pass the context
 *      data to.
 *
 * @param {Object} Consumer  -  A Context.Consumer returned from
 *      React.createContext().
 *
 * @param {Object} mapContextToProps - (Optional) Allows you to define
 *      which context values you want to accept as props and what prop names
 *      to keep them in. If empty, all props will be passed in as-is for the
 *      given context. It's probably a good idea to accept only the props
 *      you need to avoid collisions with other props.
 *
 * @return {function(*)} - Returns the input Component wrapped in a
 *      Context Consumer.
 */
const withContext = ({
    Component               = null,
    Consumer                = null,
    mapContextToProps = context => ({...context})
// eslint-disable-next-line react/display-name
}) => props => (
    <Consumer>
        {({ ...contextValue }) => (
            <Component
                {...props}
                {...mapContextToProps(contextValue)}
            />
        )}
    </Consumer>
);

export default withContext;
