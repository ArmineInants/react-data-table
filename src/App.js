/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import TableMy from './components/Table';
import Filters from './components/Filters';

const App = props => (
  <BrowserRouter>
    <div className="App">
      <Filters />
      <Switch>
        <Route exact path="/" component={TableMy} />
        <Route path="/:query" component={TableMy} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default App;
