import { createRoot } from 'react-dom/client';
import "./index.css";
import Law from './law';

// let lawId = '334AC0000000121'; // デフォルトは特許法
let lawId = '405AC0000000088'; // デフォルトは行政手続法
if (location.href.match(/lawid=(.*)/) && location.href.match(/lawid=(.*)/)![1]) {
    lawId = location.href.match(/lawid=(.*)/)![1];
}
const App = () => <div>
    <Law searchParams={{
        lawId: lawId,
        asof: undefined
    }} />
</div>

// ReactDOM.render(<App />, document.querySelector('#app'));
const container = document.getElementById('app')!;
const root = createRoot(container);
root.render(<App />);
