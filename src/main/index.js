import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import { Layout } from 'antd';
import 'antd/lib/layout/style/css';

import { Main } from '~/main/main';
import '~/main/index.scss';

const {Header, Content} = Layout;

const App = () => (
  <div className="app">
    <Layout className="layout">
        <Header className="header">
            <h1>NER</h1>
        </Header>
        <Layout>
            <Content className="content">
                <Main />
            </Content>
        </Layout>
    </Layout>
  </div>
);

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, 
    document.getElementById('root')
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}