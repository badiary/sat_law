// import Link from "next/link";
import { LawComponent } from "@api/components/law/law";
import { EnforcementDate } from "@api/components/revision-list/revision-item";
import { ModifiedLawdataResponse, getLawComponentData, getLawData } from "@api/lib/api/get-law-data";
import logger from "@api/lib/utils/logger";
import { useEffect, useState } from "react";
import { Result } from "@api/types/result";
import APIError from "./apiError";
import { renderLaw } from "@api/typescript-renderer";

// Window インターフェースを拡張してshowLawViewer関数を追加
declare global {
    interface Window {
        showLawViewer?: (data: { lawTitle: string; content: string }) => void;
    }
}

const chikujoDict: { [lawid: string]: string } = {
    "334AC0000000121": "patent",
    "334AC0000000123": "util",
    "334AC0000000125": "design",
    "334AC0000000127": "trademark",
    "353AC0000000030": "kokusai",
    "402AC0000000030": "tokurei",
    "412AC0000000049": "benrishi",
    "405AC0000000047": "fusei"
    // "335CO0000000039": "toroku"
};

/**
 * 法令画面
 * @param searchParams 検索条件
 * @returns {JSX.Element} 法令画面
 */
type Response = { result: Result<ModifiedLawdataResponse>, chikujo?: string }
export default function Law({
    searchParams,
}: {
    searchParams: {
        lawId: string;
        asof?: string;
    };
}) {
    logger.info({
        message: "[law]",
    });

    const [response, setResponse] = useState<Response>();
    useEffect(() => {
        const connect = async () => {
            // 法令本文取得API(/lawdata)を利用した本文情報の取得
            const response: any = {};
            const lawData = await getLawData(searchParams);
            response.result = lawData;

            if (chikujoDict[searchParams.lawId.split("_")[0]]) {
                const url = `../chikujo/chikujo_${chikujoDict[searchParams.lawId.split("_")[0]]}.txt`;
                const chikujoData = await (
                    fetch(url).then((response) => { return response.text() })
                );
                response.chikujo = chikujoData;
            }
            setResponse(response);
        };
        connect();
    }, []);
    useEffect(() => {
        if (response && response.result && response.result.isSuccess) {
            // TypeScript版のレンダラーを使用してHTML生成
            const laws = getLawComponentData(response.result.value.lawFullText);
            const lawHtml = renderLaw(
                laws.lawNum,
                laws.lawBody,
                laws.lawTitle,
                []
            );

            // #appにHTMLを設定
            const appElement = document.getElementById("app");
            if (appElement) {
                appElement.innerHTML = lawHtml;
            }

            // parseLaw関数でHTMLを加工
            const data = parseLaw(document.getElementById("app")?.innerHTML!, response.chikujo);

            // 統合HTMLページのshowLawViewer関数を直接呼び出し
            if (window.showLawViewer) {
                window.showLawViewer(data);
            } else {
                console.error("showLawViewer function not found");
            }
        }
    }, [response]);

    if (!response) {
        return <span>e-govの法令APIからデータを取得中...</span>;
    }

    if (response.result.isSuccess) {
        if (!response.result.value.lawFullText) {
            return <span>法令データが存在しません。</span>;
        }
        // TypeScript版レンダラーを使用してHTMLを生成（useEffect内で実行）
        return <span style={{ display: 'none' }}>法令データを処理中...</span>;
    } else {
        return <APIError message={response.result.error.message}></APIError>;
    }
}

const parseLaw = (inputHTML: string, chikujo: string | undefined) => {
    const parseParenthesis = require("parenthesis");
    const content = window.document.createElement("div");
    content.innerHTML = inputHTML;
    const lawTitle = content.querySelector("div.text-xl")!.textContent;

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
        const recursiveParser = (arr: any[], depth: number) => {
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
            const span = window.document.createElement("span");
            span.innerHTML = innerHTML;
            (node as HTMLElement).replaceWith(span);
        }
    });

    // 条文番号参照検索のための属性追加
    const articleNumArray = (Array.from(
        // content.querySelectorAll("section#MainProvision section.Article")
        content.querySelectorAll("section.Article")
    ) as HTMLElement[]).map((section) => {
        const spanElement = section.querySelector("div._div_ArticleTitle span");
        if (!spanElement) {
            console.warn("Article section without ArticleTitle span found:", section.innerHTML.substring(0, 100));
            return "-1";
        }
        const articleNum = spanElement
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
            if (!node.parentElement!.closest("section.Article")) return "-1";
            const articleNum = node.parentElement!
                .closest("section.Article")!
                .getAttribute("article_num");
            return articleNumArray[articleNumArray.indexOf(articleNum) - 1];
        } else if (text.substring(0, 1) === "次") {
            if (!node.parentElement!.closest("section.Article")) return "-1";
            const articleNum = node.parentElement!
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
            const span = window.document.createElement("span");
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
                    const childSpan = window.document.createElement("span");
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
                    const childSpan = window.document.createElement("span");
                    childSpan.setAttribute("article_num", articleNum);
                    childSpan.innerHTML = part;
                    span.append(childSpan);
                }
            }
            (node as HTMLElement).replaceWith(span);
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
            const span = window.document.createElement("span");
            span.innerHTML = innerHTML;
            (node as HTMLElement).replaceWith(span);
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
            const span = window.document.createElement("span");
            span.innerHTML = innerHTML;
            (node as HTMLElement).replaceWith(span);
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
            const span = window.document.createElement("span");
            span.innerHTML = innerHTML;
            (node as HTMLElement).replaceWith(span);
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

    if (chikujo !== undefined) {
        // 以下、逐条解説
        const chikujo_content = chikujo.replace(/^[^\r\n]*\r\n/, "");

        const articleSections = Array.from(
            content.querySelectorAll("section#MainProvision section.Article")
        ).reduce((prev: { [articleNum: string]: Element }, cur) => {
            const articleNum = cur
                .querySelector("div._div_ArticleTitle a")!
                .getAttribute("name")!
                .substring(7);
            prev[articleNum] = cur;
            return prev;
        }, {});

        const contents = chikujo_content
            .replace(
                /^(第[一二三四五六七八九〇十百千]+条(?:の[一二三四五六七八九〇十百千]+)*[\r\n]*)/gm,
                "!&!&!&$1"
            )
            .split("!&!&!&")
            .slice(1)
            .forEach((chikujoText) => {
                const articleNum = chikujoText
                    .match(
                        /^第[一二三四五六七八九〇十百千]+条(?:の[一二三四五六七八九〇十百千]+)*/
                    )![0]
                    .replace(/[第条]/g, "")
                    .replace(/の/g, "-")
                    // @ts-ignore
                    .kansuji2arabic();

                const details = window.document.createElement("details");
                const summary = window.document.createElement("summary");
                summary.innerHTML = "逐条解説";
                details.appendChild(summary);

                const content = window.document.createElement("div");
                // content.style.whiteSpace = "pre-wrap";
                content.classList.add("chikujo_detail");
                content.innerHTML = `${chikujoText
                    .replace(
                        /^第[一二三四五六七八九〇十百千]+条(?:の[一二三四五六七八九〇十百千]+)*[\r\n]*/,
                        ""
                    )
                    .replace(/[\r\n]*$/, "")
                    .replace(/実意商/g, "")
                    .replace(/意商/g, "")
                    .replace(/実意/g, "")
                    }`;

                textNodeFunc(content, (node) => {
                    const innerHTML = parseBracket(node.textContent!);
                    if (innerHTML.indexOf("<") !== -1) {
                        const span = window.document.createElement("span");
                        span.innerHTML = innerHTML;
                        (node as HTMLElement).replaceWith(span);
                    }
                });
                clearSpan(content);

                // 条文番号参照検索のための属性追加
                let tempArticleNum = "-1";
                const getArticleNum = (node: Node, text: string) => {
                    if (text.substring(0, 1) === "前") {
                        if (!node.parentElement!.closest("section.Article")) return "-1";
                        const articleNum = node.parentElement!
                            .closest("section.Article")!
                            .getAttribute("article_num");
                        return articleNumArray[articleNumArray.indexOf(articleNum) - 1];
                    } else if (text.substring(0, 1) === "次") {
                        if (!node.parentElement!.closest("section.Article")) return "-1";
                        const articleNum = node.parentElement!
                            .closest("section.Article")!
                            .getAttribute("article_num");
                        return articleNumArray[articleNumArray.indexOf(articleNum) + 1];
                    } else if (text.substring(0, 1) === "同") {
                        return tempArticleNum;
                    } else {
                        // 普通に数字を返す
                        return text
                            .match(
                                /第?[一二三四五六七八九〇十百千]+条(?:の[一二三四五六七八九〇十百千]+)*/
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
                        /((?:第?[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:から(?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*[第一二三四五六七八九〇十百千前同次項号の]*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:まで)?)?)/g
                    );
                    if (res.length > 1) {
                        // 最後におかしくならないようにspanを作ってそこに全部入れる
                        const span = window.document.createElement("span");
                        for (let i = 0; i < res.length; i++) {
                            const part = res[i];
                            if (
                                !part.match(
                                    /((?:第?[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:から(?:第[一二三四五六七八九〇十百千]+|[前同次])条(?:の[一二三四五六七八九〇十百千]+)*[第一二三四五六七八九〇十百千前同次項号の]*(?:[第一二三四五六七八九〇十百千前同次の]*[一二三四五六七八九〇十百千項号])?(?:まで)?)?)/
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
                                const childSpan = window.document.createElement("span");
                                childSpan.setAttribute(
                                    "article_num",
                                    `${articleNums[0]},${articleNums[1]}`
                                );
                                childSpan.innerHTML = part;
                                span.append(childSpan);
                            } else {
                                // 単独の条のパターン
                                const articleNum = getArticleNum(node, part);
                                const childSpan = window.document.createElement("span");
                                if (articleNum !== "-1") {
                                    tempArticleNum = articleNum;
                                    childSpan.setAttribute("article_num", articleNum);
                                }
                                childSpan.innerHTML = part;
                                span.append(childSpan);
                            }
                        }
                        (node as HTMLElement).replaceWith(span);
                    }
                });
                clearSpan(content);

                // 条文のリンクを追加
                textNodeFunc(content, (node) => {
                    const innerHTML = node.textContent!.replace(
                        /第?[一二三四五六七八九〇十百千]+条(の[一二三四五六七八九〇十百千]+)*/g,
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
                        const span = window.document.createElement("span");
                        span.innerHTML = innerHTML;
                        (node as HTMLElement).replaceWith(span);
                    }
                });
                clearSpan(content);

                // 項、号にスタイルを適用
                textNodeFunc(content, (node) => {
                    const innerHTML = node.textContent!.replace(
                        /([前次]条|[第前同次各一二三四五六七八九〇十百千]+[項号](の[一二三四五六七八九〇十百千]+)*)/g,
                        (text) => {
                            return `<span class="refNum"> ${text}</span>`;
                        }
                    );
                    if (innerHTML.indexOf("<") !== -1) {
                        const span = window.document.createElement("span");
                        span.innerHTML = innerHTML;
                        (node as HTMLElement).replaceWith(span);
                    }
                });
                clearSpan(content);

                details.appendChild(content);
                if (articleSections[articleNum]) {
                    articleSections[articleNum].appendChild(details);
                }
            });
    }



    // 定義された用語への下線追加
    type Info = {
        span: Element,
        word: string,
        article?: string,
        ko?: string,
        go?: string,
        sentence?: string,
        articleNums?: string[],
        flag?: boolean
    };
    const definitionInfo: Info[] = [];

    // 「」で囲まれた定義語（こちらを先にすることで、（同じ。）よりもこちらを優先するよう上書きする）
    Array.from(content.querySelectorAll("span.bracket3")).forEach((span) => {
        const text = span.closest("div")!.textContent!;
        if (text.includes("」とあるのは") || text.includes("」と読み替え")) return;
        if (!text.includes("」と")) return;
        if (span.closest(".SupplProvision")) return;
        if (span.closest("details")) return false;
        if (!span.closest("section")!.getAttribute("article_num")) return;

        const word = span.textContent!.slice(1, -1);
        // if (word.length < 1) return;

        if (!definitionInfo.some((info) => {
            return info.word === word;
        })) {
            definitionInfo.push({ span: span.parentElement!, word: word });
        }
    });

    // （同じ。）で定義語を抽出。漢字カタカナで区切って対応語を抽出。
    Array.from(content.querySelectorAll("section.Article span.bracket2")).forEach((span) => {
        if (span.closest(".SupplProvision")) return false;
        if (span.closest("details")) return false;

        // 入れ子の括弧を除去
        const cloneSpan = (span.cloneNode(true) as HTMLElement);
        Array.from(cloneSpan.querySelectorAll("span.bracket2")).forEach((childSpan) => {
            if (childSpan) childSpan.remove();
        })
        if (!cloneSpan.textContent!.includes("同じ。")) return;
        if (cloneSpan.querySelector("span.bracket3")) return; // カギ括弧があるなら無視（span.bracket2の方で拾う）
        if (!span.previousElementSibling && !span.previousSibling) return;

        const textInverse = (span.previousSibling ? span.previousSibling : span.previousSibling)!.textContent!.split("").reverse().join("");
        const wordInverse = textInverse.match(/(^[ァ-ヶーｱ-ﾝﾞﾟ一-龥0-9０-９a-zA-Zａ-ｚＡ-Ｚ.．]+)/);
        if (wordInverse) {
            const word = wordInverse[0].split("").reverse().join("");
            // if (word.length < 1) return;
            if (!definitionInfo.some((info) => {
                return info.word === word;
            })) {
                definitionInfo.push({ span: span, word: word, flag: true });
            }
        }
    });

    // ワードを定義している条、項、号、地の文章を取得
    const articleTextArray = Array.from(content.querySelector("#MainProvision")!.querySelectorAll("section.Article"))
        .reduce((prev: any, section) => {
            let textContent = "";
            if (section.querySelector("details")) {
                const cloneSection = (section.cloneNode(true) as HTMLElement);
                Array.from(cloneSection.querySelectorAll("details")).forEach((details) => {
                    details.remove();
                });
                textContent = cloneSection.textContent!;
            } else {
                textContent = section.textContent!;
            }
            prev[section.getAttribute("article_num")!] =
                textContent!.replaceAll(/[第前次同][一二三四五六七八九〇十百千]+[部章条項号]/g, "")
                    .replaceAll(/[前次同][部章条項号]/g, "")
                    .replaceAll(/^[０-９一二三四五六七八九〇十百千]+\s/gm, "");
            return prev;
        }, {});
    const wholeArticleText = Object.values(articleTextArray).join(" ");

    definitionInfo.forEach((info) => {
        info.article = info.span.closest("section")!.getAttribute("article_num")!;
        if (info.span.closest("._div_ParagraphSentence")) {
            info.ko = zen2Han(info.span.closest("._div_ParagraphSentence")!.querySelector("span")!.textContent!);
        } if (info.span.closest("._div_ItemSentence")) {
            // @ts-ignore
            info.go = info.span.closest("._div_ItemSentence")!.querySelector("span")!.textContent!.kansuji2arabic();
        }
        info.sentence = info.span.closest("div")!.textContent!;

        // 「○条において」のパターンを抽出
        info.articleNums = [];
        if (info.span.textContent!.includes("において")) {
            // spanをクローンして入れ子の括弧を削除
            const cloneSpan = (info.span.cloneNode(true) as HTMLElement);
            Array.from(cloneSpan.querySelectorAll("span.bracket2")).forEach((childSpan) => {
                if (childSpan) childSpan.remove();
            });
            info.articleNums = Array.from(cloneSpan.querySelectorAll("span[article_num]")).map((articleSpan) => {
                return articleSpan.getAttribute("article_num")!;
            });
            if (info.span.textContent!.includes("この条")) {
                info.articleNums.push(info.article);
            }
            if (info.articleNums.length === 0 && (/[項号ア-ン]において/.test(info.span.textContent!))) {
                info.articleNums.push(info.article);
            }
        }

        // 符号分析と同じロジックでwordを拡張
        // if (info.flag) {
        //   const textBlock = (info.span.previousSibling ? info.span.previousSibling : info.span.previousSibling).textContent
        //     .split("").reverse().join("")
        //     .match(/[のァ-ヶーｱ-ﾝﾞﾟ一-龥0-9０-９a-zA-Zａ-ｚＡ-Ｚ.．]+/)[0] // TODO あ-んに戻したうえで、名詞句単位を抜き出したい...
        //     .split("").reverse().join("");

        //   const textArray = textBlock.split(/([ァ-ヶーｱ-ﾝﾞﾟ一-龥0-9０-９a-zA-Zａ-ｚＡ-Ｚ.．]+)/)
        //     .reverse()
        //     .reduce((prev, cur) => {
        //       if (cur.length > 0) {
        //         prev.push(`${ cur }${ prev[prev.length - 1] } `);
        //       }
        //       return prev;
        //     }, [""]).filter((text, i) => { return i % 2 == 1 });

        //   if (textArray.length > 1) {
        //     let hitnum = 0, prevHitnum = 1;
        //     let word = "";
        //     while (textArray.length > 0) {
        //       word = textArray.shift();
        //       prevHitnum = hitnum;

        //       // articleNumsに応じて検索対象のテキストを用意する
        //       let searchText = "";
        //       if (info.articleNums.length === 0) {
        //         searchText = wholeArticleText;
        //       } else {
        //         searchText = Object.entries(articleTextArray).filter(([article_num, val]) => {
        //           return info.articleNums.some((articleNum) => {
        //             return hasIntersection(articleNum, article_num);
        //           })
        //         }).map(([article_num, val]) => {
        //           return val;
        //         }).join(" ");
        //       }

        //       hitnum = [...searchText.matchAll(new RegExp(word, "g"))].length;
        //       if (hitnum / prevHitnum < 0.5 || hitnum < 2) { // 50%。決め打ち
        //         info.word = word;
        //         break;
        //       }

        //     }
        //   }

        // }


    });

    // 条文番号同士の重なりを判定する関数
    function hasIntersection(articleNum1: string, articleNum2: string) {
        const compareArticleNum: (inputNum1: string, inputNum2: string) => -1 | 0 | 1 = (
            inputNum1: string,
            inputNum2: string
        ) => {
            const num1 = inputNum1.match(/^[0-9]+/)![0];
            const num2 = inputNum2.match(/^[0-9]+/)![0];
            if (Number(num1) < Number(num2)) {
                return -1;
            } else if (Number(num1) > Number(num2)) {
                return 1;
            } else if (inputNum1 === inputNum2) {
                return 0;
            }

            // 以下、最初の数字が同じパターン
            const nums1 = inputNum1.split("-");
            const nums2 = inputNum2.split("-");

            if (nums1.length > 1 && nums2.length > 1) {
                return compareArticleNum(
                    nums1.slice(1).join("-"),
                    nums2.slice(1).join("-")
                );
            }
            if (nums1.length > 1) return 1;
            if (nums2.length > 1) return -1;

            return 0;
        };

        const isIncluded = (range: string[], num: string) => {
            const res1 = compareArticleNum(range[0], num);
            const res2 = compareArticleNum(range[1], num);
            if (res1 === 0 || res2 === 0 || res1 !== res2) {
                return true;
            } else {
                return false;
            }
        };

        if (articleNum1.indexOf(",") !== -1) {
            if (articleNum2.indexOf(",") !== -1) {
                // 両方範囲のパターン
                const articleNums1 = articleNum1.split(",");
                const articleNums2 = articleNum2.split(",");
                return (
                    isIncluded(articleNums1, articleNums2[0]) ||
                    isIncluded(articleNums1, articleNums2[1]) ||
                    isIncluded(articleNums2, articleNums1[0]) ||
                    isIncluded(articleNums2, articleNums1[1])
                );
            } else {
                // 片方だけ範囲のパターン
                return isIncluded(articleNum1.split(","), articleNum2);
            }
        } else {
            if (articleNum2.indexOf(",") !== -1) {
                // 片方だけ範囲のパターン
                return isIncluded(articleNum2.split(","), articleNum1);
            } else {
                // 両方点のパターン
                return articleNum1 === articleNum2;
            }
        }
    };
    // 再帰的に定義語のスタイルを適用する関数
    function addDefStyle(node: Node, definitionInfo: Info[]) {
        if (node.nodeType === 3) {
            const tempDefinitionInfo = [...definitionInfo];

            while (tempDefinitionInfo.length > 0) {
                const info = tempDefinitionInfo.shift()!;
                if (!node.textContent!.includes(info.word)) {
                    continue;
                };

                // TODO ここ、あらかじめ処理しておきたい（何にも包含されないものを逐次取り出していけばOK？）
                // if (tempDefinitionInfo.some((info2) => {
                //   return info2.word.includes(info.word);
                // })) {
                //   tempDefinitionInfo.push(info);
                //   continue;
                // }

                let popupText = info.article!.replace(/(^[0-9]+$)/, "$1条").replace(/(?=-)/, "条").replaceAll("-", "の").replace(/(の[0-9]+$)/, "$1 ");
                if (info.ko) {
                    popupText += info.ko.replace(/(^[0-9]+$)/, "$1項").replace(/(?=-)/, "項").replaceAll("-", "の").replace(/(の[0-9]+$)/, "$1 ");
                } else if (info.go) {
                    popupText += "1項";
                }
                if (info.go) {
                    popupText += info.go.replace(/(^[0-9]+$)/, "$1号").replace(/(?=-)/, "号").replaceAll("-", "の");
                }

                const span = window.document.createElement("span");
                const tooltipHTML = `<b>${popupText}</b><br>${info.sentence!.replaceAll(info.word, `<span class='tooltipWord'>${info.word}</span>`)}`;
                span.innerHTML = node.textContent!.replaceAll(info.word, `<span class="defined" data-tooltip="${tooltipHTML}">${info.word}</span>`);
                (node as HTMLElement).replaceWith(span);

                addDefStyle(span, tempDefinitionInfo);
                break;

            }
        } else {
            if (node.nodeType === 1 && ((node as HTMLElement).classList.contains("defined") || (node as HTMLElement).classList.contains("tooltipWord"))) {
                return;
            };
            if (node.childNodes.length > 0) {
                node.childNodes.forEach((childNode) => {
                    if (childNode.nodeType === 1 && ((childNode as HTMLElement).classList.contains("defined") || (childNode as HTMLElement).classList.contains("tooltipWord"))) {
                        return;
                    };

                    if (childNode.nodeType === 1 && (childNode as HTMLElement).tagName === "SECTION" && (childNode as HTMLElement).getAttribute("article_num")) {
                        addDefStyle(childNode, definitionInfo.filter((info) => {
                            if (info.articleNums!.length === 0) return true;
                            return info.articleNums!.some((articleNum) => {
                                return hasIntersection((childNode as HTMLElement).getAttribute("article_num")!, articleNum);
                            });
                        }));
                    } else {
                        addDefStyle(childNode, definitionInfo);
                    }
                });
            }
        }
    }

    // 定義語の包含関係を整理
    const definitionInfoArranged = [];
    while (definitionInfo.length > 0) {
        const info = definitionInfo.shift()!;
        if (definitionInfo.some((info2) => {
            return info2.word.includes(info.word)
        })) {
            definitionInfo.push(info);
        } else {
            definitionInfoArranged.push(info);
        }
    }

    // スタイルを付与していく
    addDefStyle(content.querySelector("section#MainProvision")!, definitionInfoArranged);
    clearSpan(content);

    return { lawTitle: lawTitle, content: content.innerHTML };
};
