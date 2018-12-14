/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Table from './components/Table';
import Filters from './components/Filters';

const App = props => (
  <BrowserRouter>
    <div className="App">
      <Filters />
      <Switch>
        <Route exact path="/" component={Table} />
        <Route path="/:query" component={Table} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default App;
