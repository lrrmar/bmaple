import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
//import 'semantic-ui-css/semantic.min.css';

import './index.css';
import App, { store } from './App';
import AppTimelines from './AppTimelines';

import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename='/app'>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="timelines" element={<AppTimelines />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
