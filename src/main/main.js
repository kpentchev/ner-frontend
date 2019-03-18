import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

const NerContainer = lazy(() => import('~/main/NerContainer'));

const Main = () => (
  <div className="content-main">
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path='/' component={props => <NerContainer {...props} /> } />
      </Switch>
    </Suspense>
  </div>
)

export {Main};