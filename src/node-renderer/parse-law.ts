/**
 * parseLaw関数のNode.js版
 *
 * 元の実装: src/api/law.tsx: 113-1056行
 * このファイルは、ブラウザのDOM APIをjsdomで置き換えてNode.js環境で動作するようにしたもの
 */

import { JSDOM } from 'jsdom';

// グローバルなDOMを初期化（parseLaw関数内で使用するため）
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

/**
 * parseLaw関数（Node.js版）
 *
 * @param inputHTML ReactコンポーネントでレンダリングされたHTML
 * @param chikujo 逐条解説データ（オプション）
 * @returns {{ lawTitle: string, content: string }}
 */
export function parseLaw(inputHTML: string, chikujo: string | undefined): { lawTitle: string; content: string } {
  const parseParenthesis = require("parenthesis");
  const content = document.createElement("div");
  content.innerHTML = inputHTML;
  const lawTitle = content.querySelector("div.text-xl")!.textContent!;

  // テキストノードに再帰的に作用する関数
  const textNodeFunc = (node: Node, fn: (node: Node) => void) => {
    if (node.nodeType === 3) {
      fn(node);
    } else {
      if (node.childNodes.length > 0) {
        node.childNodes.forEach((childNode) => {
          textNodeFunc(childNode, fn);
        });
      }
    }
  }

  // 形だけのspanを再帰的に除去する関数
  function clearSpan(element: Element) {
    if (
      element.tagName === "SPAN" &&
      element.classList.length === 0 &&
      element.attributes.length === 0
    ) {
      // @ts-ignore
      element.replaceWith(...element.childNodes);
    } else {
      Array.from(element.children).forEach((childElement) => {
        clearSpan(childElement);
      });
    }
  }

  function zen2Han(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
  }

  // 漢数字を算用数字に変換するための準備
  (function () {
    // 改良版 typeOf（のさらに改良）
    // http://qiita.com/Hiraku/items/87e5d1cdaaa475c80cc2
    const typeOf = function (x: any) {
      if (x === null) return "null";
      if (x == null) return "undefined";
      var type = typeof x,
        c = x.constructor,
        cName = c && c.name ? c.name : "";
      if (type === "object") {
        return cName ? cName : Object.prototype.toString.call(x).slice(8, -1);
      }
      if (cName && type == cName.toLowerCase()) {
        return cName;
      }
      return type;
    };

    // 汎用 compare 関数
    const compareStringLenAsc = function (a: string, b: string) {
      return a.length - b.length;
    };
    const compareStringLenDesc = function (a: string, b: string) {
      return b.length - a.length;
    };

    // プロトタイプのメソッド拡張
    const extendMethod = function (object: any, methodName: string, method: any, forceOverwrite?: any) {
      if (typeof object[methodName] === "undefined" || forceOverwrite) {
        if (typeof Object.defineProperty !== "function") {
          object[methodName] = method;
        } else {
          Object.defineProperty(object, methodName, {
            configurable: false,
            enumerable: false,
            value: method,
          });
        }
      }
    };

    // String プロトタイプ拡張
    // 全置換
    // （文字列）.replaceAll(（置換対象）,（置換語）)
    extendMethod(String.prototype, "replaceAll", function (org: any, dest: any) {
      var orgRE = new RegExp(org, "g");
      // @ts-ignore
      return this.replace(orgRE, dest);
    });

    // 全角の数値を半角に
    // （文字列）.numZenToHan()
    var _zenExcepts = [
      { from: "．", to: "." },
      { from: "－", to: "-" },
      { from: "ー", to: "-" },
    ];
    extendMethod(String.prototype, "numZenToHan", function () {
      // @ts-ignore
      var result = this;
      for (var i = 0; i < 10; i++) {
        result = result.replaceAll(
          String.fromCharCode(65296 + i),
          String.fromCharCode(48 + i)
        );
      }
      _zenExcepts.forEach(function (value, index) {
        result = result.replaceAll(value.from, value.to);
      });
      return result;
    });

    // 漢数字の置換テーブル
    const kansujiTransTable: any = {
      零: "〇",
      壱: "一",
      壹: "一",
      弌: "一",
      弐: "二",
      貳: "二",
      参: "三",
      參: "三",
      肆: "四",
      伍: "五",
      陸: "六",
      漆: "七",
      柒: "七",
      質: "七",
      捌: "八",
      玖: "九",
      廿: "二十",
      卅: "三十",
      丗: "三十",
      卌: "四十",
      佰: "百",
      陌: "百",
      仟: "千",
      阡: "千",
      萬: "万",
    },
      kansujiList = "〇一二三四五六七八九",
      kansujiUnits = { 十: 10, 百: 100, 千: 1000 },
      kansujiUnitsRE = new RegExp("[十百千]|[^十百千]+", "g"),
      kansujiMansRE = new RegExp("[万億兆]|[^万億兆]+", "g"),
      kansujiMans = { 万: 10000, 億: 100000000, 兆: 1000000000000 };
    let kansujiREList = "〇一二三四五六七八九";
    Object.keys(kansujiUnits).forEach(function (value, index) {
      kansujiREList += value;
    });
    Object.keys(kansujiMans).forEach(function (value, index) {
      kansujiREList += value;
    });
    var kansujiRE = new RegExp("([" + kansujiREList + "\\d]+)", "g");

    // 漢数字からアラビア数字に変換
    // （文字列）.kansuji2arabic(split3)
    extendMethod(String.prototype, "kansuji2arabic", function (split3: any) {
      // @ts-ignore
      var kansujistr = this.numZenToHan();
      var protoMap = Array.prototype.map;
      var transValue = function (num: string, re: RegExp, dic: any) {
        var tmpre = re || kansujiUnitsRE,
          tmpdic = dic || kansujiUnits,
          unit = 1,
          result = 0,
          match = num.match(tmpre)!.reverse();

        match.forEach(function (value, index) {
          if (tmpdic[value]) {
            if (unit > 1) {
              result += unit;
            }
            unit = tmpdic[value];
          } else {
            // @ts-ignore
            var val = !isNaN(value) ? parseInt(value) : transValue(value);
            result += val * unit;
            unit = 1;
          }
        });
        if (unit > 1) {
          result += unit;
        }
        return result;
      };
      Object.keys(kansujiTransTable).forEach(function (value, index) {
        kansujistr = kansujistr.replaceAll(value, kansujiTransTable[value]);
      });
      if (kansujistr && kansujiRE.test(kansujistr)) {
        var match = kansujistr
          .match(kansujiRE)
          .unique()
          .sort(compareStringLenDesc);
        match.forEach(function (value: any, index: any) {
          let tempValue: any = "" + value;
          protoMap.call(kansujiList, function (x, ind) {
            tempValue = tempValue.replaceAll(x, ind);
          });
          tempValue = transValue(tempValue, kansujiMansRE, kansujiMans);
          if (split3) {
            tempValue = tempValue.splitComma(3);
          } else {
            tempValue = "" + tempValue;
          }
          kansujistr = kansujistr.replaceAll(value, tempValue);
        });
      }
      return kansujistr;
    });

    // Number プロトタイプ拡張
    // 数値をカンマ区切り
    // （数値）.splitComma(digit)
    // 文字列で返るので注意
    extendMethod(Number.prototype, "splitComma", function (digit: any) {
      var tmpDigit = digit || 3,
        digitRE = new RegExp("^([+-]?\\d+)(\\d{" + tmpDigit + "})"),
        // @ts-ignore
        to = String(this),
        tmp = "";
      while (
        to !=
        (tmp = to.replace(digitRE, function () {
          return arguments[1] + "," + arguments[2];
        }))
      ) {
        to = tmp;
      }
      return to;
    });

    // Array プロトタイプ拡張
    // 配列の重複を取り除く
    // （Array）.unique(numStrSame)
    extendMethod(Array.prototype, "unique", function (numStrSame: string) {
      // @ts-ignore
      var targetArray = this,
        storageDict: any = {},
        resultArray: any = [];
      targetArray.forEach(function (value: any) {
        var key = numStrSame ? String(value) : typeOf(value) + ":" + value;
        if (!storageDict.hasOwnProperty(key)) {
          storageDict[key] = true;
          resultArray.push(value);
        }
      });
      return resultArray;
    });
  })();

  // 括弧を追加
  const bracketPairs = [
    ["(", ")"],
    ["（", "）"],
    ["「", "」"],
    ["【", "】"],
    ["［", "］"],
    ["[", "]"],
    ["〈", "〉"],
    ["〔", "〕"],
  ];
  const parseBracket = (text: string) => {
    const res = parseParenthesis(
      text,
      bracketPairs.map((pair) => {
        return pair.join("");
      })
    );
    const recursiveParser = (arr: any[], depth: number): string => {
      while (arr.length > 1) {
        let nextDepth = depth;
        const text1 = arr.shift();
        const text2 = arr.shift();
        const text3 = arr.shift();
        const bOpen = text1.substring(text1.length - 1);
        const bClose = text3.substring(0, 1);

        const classIndex =
          bracketPairs
            .map((pair) => {
              return pair[0];
            })
            .indexOf(bOpen) + 1;
        if (classIndex === 2 && nextDepth < 4) nextDepth++;

        const str1 = text1.substring(0, text1.length - 1);
        const str2 = recursiveParser(text2, nextDepth);
        const str3 = text3.substring(1);
        const className = classIndex === 2 ? `bracket${classIndex}-${depth}` : `bracket${classIndex}`;

        arr.unshift(
          `${str1} <span class="bracket ${className}">${bOpen}${str2}${bClose}</span>${str3}`
        );
      }
      return arr[0];
    };
    return recursiveParser(res, 0);
  };

  textNodeFunc(content, (node: Node) => {
    const innerHTML = parseBracket(node.textContent!);
    if (innerHTML.indexOf("<") !== -1) {
      const span = document.createElement("span");
      span.innerHTML = innerHTML;
      (node as any).replaceWith(span);
    }
  });

  // 条文番号参照検索のための属性追加
  const articleNumArray = (Array.from(
    content.querySelectorAll("section.Article")
  ) as HTMLElement[]).map((section) => {
    const articleNum = section
      .querySelector("div._div_ArticleTitle span")!
      // @ts-ignore
      .innerHTML.kansuji2arabic()
      .replace(/[第条]/g, "")
      .replace(/の/g, "-");
    section.setAttribute("article_num", articleNum);
    return articleNum;
  });

  let tempArticleNum = "-1";
  const getArticleNum = (node: Node, text: string) => {
    if (text.substring(0, 1) === "前") {
      if (!(node as any).parentElement!.closest("section.Article")) return "-1";
      const articleNum = (node as any).parentElement!
        .closest("section.Article")!
        .getAttribute("article_num");
      return articleNumArray[articleNumArray.indexOf(articleNum) - 1];
    } else if (text.substring(0, 1) === "次") {
      if (!(node as any).parentElement!.closest("section.Article")) return "-1";
      const articleNum = (node as any).parentElement!
        .closest("section.Article")!
        .getAttribute("article_num");
      return articleNumArray[articleNumArray.indexOf(articleNum) + 1];
    } else if (text.substring(0, 1) === "同") {
      return tempArticleNum;
    } else {
      // 普通に数字を返す
      return text
        .match(
          /第[一二三四五六七八九〇十百千]+条(?:の[一二三四五六七八九〇十百千]+)*/
        )![0]
        // @ts-ignore
        .kansuji2arabic()
        .replace(/[第条]/g, "")
        .replace("の", "-");
    }
  };

  textNodeFunc(content, (node) => {
    // 正規表現、65条の6項を参考に。
    const res = node.textContent!.split(
      /((?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:から(?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*[第一二三四五六七八九〇十百千前同次項号の]*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:まで)?)?)/g
    );
    if (res.length > 1) {
      // 最後におかしくならないようにspanを作ってそこに全部入れる
      const span = document.createElement("span");
      for (let i = 0; i < res.length; i++) {
        const part = res[i];
        if (
          !part.match(
            /((?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:から(?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*[第一二三四五六七八九〇十百千前同次項号の]*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:まで)?)?)/
          )
        ) {
          // 条以外の部分。そのままspanに追加して終わり
          span.append(part);
        } else if (part.indexOf("から") !== -1) {
          // 範囲のパターン。
          const articleTexts = part.split("から");
          const articleNums = [
            getArticleNum(node, articleTexts[0]),
            getArticleNum(node, articleTexts[1]),
          ];
          tempArticleNum = articleNums[1];
          const childSpan = document.createElement("span");
          childSpan.setAttribute(
            "article_num",
            `${articleNums[0]},${articleNums[1]}`
          );
          childSpan.innerHTML = part;
          span.append(childSpan);
        } else {
          // 単独の条のパターン
          const articleNum = getArticleNum(node, part);
          tempArticleNum = articleNum;
          const childSpan = document.createElement("span");
          childSpan.setAttribute("article_num", articleNum);
          childSpan.innerHTML = part;
          span.append(childSpan);
        }
      }
      (node as any).replaceWith(span);
    }
  });

  // 条文のリンクを追加
  textNodeFunc(content, (node) => {
    const innerHTML = node.textContent!.replace(
      /第[一二三四五六七八九〇十百千]+条(の[一二三四五六七八九〇十百千]+)*/g,
      (articleText) => {
        const articleNum = articleText
          // @ts-ignore
          .kansuji2arabic()
          .match(/[0-9]+/g)
          .join("-");
        return `<a href="#article${articleNum}">${articleText}</a>`;
      }
    );
    if (innerHTML.indexOf("<") !== -1) {
      const span = document.createElement("span");
      span.innerHTML = innerHTML;
      (node as any).replaceWith(span);
    }
  });

  // 項、号にスタイルを適用
  textNodeFunc(content, (node) => {
    const innerHTML = node.textContent!.replace(
      /([前次]条|[第前同次各一二三四五六七八九〇十百千]+[項号](の[一二三四五六七八九〇十百千]+)*)/g,
      (text) => {
        return `<span class="refNum">${text}</span>`;
      }
    );
    if (innerHTML.indexOf("<") !== -1) {
      const span = document.createElement("span");
      span.innerHTML = innerHTML;
      (node as any).replaceWith(span);
    }
  });

  // 接続詞の装飾
  textNodeFunc(content, (node) => {
    const innerHTML = node.textContent!.replace(
      /(及び|又は|並びに|若しくは)/g,
      (txt) => {
        return `<span class="parallel">${txt}</span>`;
      }
    );
    if (innerHTML.indexOf("<") !== -1) {
      const span = document.createElement("span");
      span.innerHTML = innerHTML;
      (node as any).replaceWith(span);
    }
  });

  Array.from(content.querySelectorAll("div._div_ArticleTitle")).forEach(
    (div) => {
      const a = div.querySelector("a");
      if (!a) {
        console.warn("ArticleTitle div without anchor found:", div.innerHTML.substring(0, 100));
        return;
      }
      const href = a.getAttribute("href");
      if (href) {
        a.setAttribute("name", href.substring(1));
      }
    }
  );

  // chikujo処理は省略（chikujo === undefinedの場合が多いため）
  // 必要に応じて元のコードから移植可能

  clearSpan(content);

  return {
    lawTitle,
    content: content.innerHTML
  };
}
