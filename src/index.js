import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import WebFont from 'webfontloader';
import { BrowserRouter } from 'react-router-dom';

WebFont.load({
	google: {
		families: ['Roboto:300,400,500,700:cyrillic', 'sans-serif']
	}
});

ReactDOM.render((
	<BrowserRouter>
		<App />
	</BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();
