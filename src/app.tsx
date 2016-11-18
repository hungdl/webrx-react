declare let module: any;

import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// import all custom styles
import './Style/App.less';

// import framework API surface
import * as wxr from './webrx-react';

// grab the DOM entry point
const container = document.getElementById('app');

if (container) {
  const props = {
    viewModel: new wxr.Components.AppViewModel(),
    copyright: 'webrx-react',
  };

  render(
    (
      <AppContainer>
        <wxr.Components.AppView { ...props } />
      </AppContainer>
    ),
    container,
  );

  if ((module as any).hot) {
    (module as any).hot.accept('./webrx-react', () => {
      const HMRTestApp = require('./Components/Common/App/AppView').AppView;

      render(
        (
          <AppContainer>
            <HMRTestApp { ...props } />
          </AppContainer>
        ),
        container
      );
    });
  }
}
