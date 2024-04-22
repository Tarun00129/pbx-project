import React from 'react';
import Test from 'src/components/Test/Test';
import withLayout from 'src/components/hoc/withLayout';

const IndexRoute = props => <Test {...props} />;

export default withLayout(IndexRoute);
