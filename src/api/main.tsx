import "./index.css";
import { loadLaw } from './law';

// URLパラメータを取得
const urlParams = new URLSearchParams(location.search);

// let lawId = '334AC0000000121'; // デフォルトは特許法
let lawId = urlParams.get('lawid') || '405AC0000000088'; // デフォルトは行政手続法
let lawRevisionId = urlParams.get('lawRevisionId') || undefined;

// エントリーポイント: loadLaw関数を呼び出し
loadLaw({
    lawId: lawId,
    lawRevisionId: lawRevisionId,
    asof: undefined
});
