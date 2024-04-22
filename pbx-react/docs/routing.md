# Routing

This app uses [React Router v6](https://reactrouter.com/) for its routing system.

## Configuration

Routes are defined in [App.js](./../src/components/App/App/App.js).

Route paths are defined in [route-paths.js](./../src/config/route-paths.js).

Create a new route by using the `yarn generate route` command, which will create a route file, and update the config files.

The command will default the url to a kebab-cased version of the name you pass in (eg: "foo bar" becomes "/foo-bar"). You may update this in [route-paths.js](./../src/config/route-paths.js).

## Linking Routes

Use react router's [Link](https://reacttraining.com/react-router/web/api/Link) component, along with [route-paths.js](./../src/config/route-paths.js) to link to routes:

```js
import routePaths from 'src/config/route-paths';
import { Link } from 'react-router-dom';

<Link
    to={routePaths.index}
>
    Homepage
</Link>
```

### Dynamic Route Links

If you have a route that has a dynamic value, use react router's [generatePath](https://reacttraining.com/react-router/core/api/generatePath):

```js
// route-paths.js
{
    fooDetails: '/foo/:id',
},

// some route file
import routePaths from 'src/config/route-paths';
import { Link, generatePath } from 'react-router-dom';

<Link
    to={generatePath(routePaths.fooDetails, {
        id: '123',
    })}
>
    Link to fooDetails with id 123
</Link>
```
