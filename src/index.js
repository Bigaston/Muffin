import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

import "./index.css"

import {
  RecoilRoot,
} from 'recoil';

ReactDOM.render(
  	<React.StrictMode>
		<RecoilRoot>
			<App />
		</RecoilRoot>
  	</React.StrictMode>,
  document.getElementById('root')
);

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
