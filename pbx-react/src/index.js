import React from 'react';
import { createRoot } from 'react-dom/client';
import AppContainer from 'src/components/App/AppContainer/AppContainer';
import './index.scss';

const render = Component => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(<Component />);
};

render(AppContainer);
