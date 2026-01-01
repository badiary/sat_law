/**
 * Node.js環境用のSVGモック
 *
 * Reactコンポーネント内でSVGファイルをインポートしている箇所を
 * Node.js環境で動作させるためのモック
 */

// SVGファイルの代わりに空の関数を返す
module.exports = () => null;
