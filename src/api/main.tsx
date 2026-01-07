import "./index.css";
import { loadLaw } from './law';

// let lawId = '334AC0000000121'; // デフォルトは特許法
let lawId = '405AC0000000088'; // デフォルトは行政手続法
if (location.href.match(/lawid=(.*)/) && location.href.match(/lawid=(.*)/)![1]) {
    lawId = location.href.match(/lawid=(.*)/)![1];
}

// エントリーポイント: loadLaw関数を呼び出し
loadLaw({
    lawId: lawId,
    asof: undefined
});
