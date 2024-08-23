import App from './App';
import {render} from  "@wordpress/element"
import { jsx as _jsx } from 'react/jsx-runtime'


const container = document.getElementById('addon');
// const root = createRoot(container); 
render(<App />, container);
