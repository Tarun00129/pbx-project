import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom';
import config from 'src/config/app';
import routePaths from 'src/config/route-paths';

// PLOP: Import routes below
import ParentRoute from 'src/components/routes/ParentRoute';
import IndexRoute from 'src/components/routes/IndexRoute';

const App = () => {

    return (

        <BrowserRouter
            basename={config.publicPath}
        >

            <Routes>

                <Route
                    element={<ParentRoute.Provider />}
                >

                    <Route
                        path={routePaths.index}
                        element={<IndexRoute />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

};

export default App;
