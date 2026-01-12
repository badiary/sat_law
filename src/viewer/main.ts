"use strict";
import * as sat_modules from "./sat";
// Split.js を削除して自作の幅調整機能を実装
// @ts-ignore
import hotkeys from "hotkeys-js/dist/hotkeys";

let sat: sat_modules.Sat;

// Window インターフェースを拡張してinitialize関数を追加
declare global {
  interface Window {
    initialize?: () => Promise<void>;
  }
}

/*
 * ====================== ページ読み込み完了時の動作関連 ======================
 */
const initialize = async () => {
  // content_root, content_window設定
  const content_window = window;
  const content_root = document.getElementById("content")!;

  // スペクトルバー初期化
  const div_style = window.getComputedStyle(
    document.getElementById("spectrum")!
  );
  const cv = document.getElementById("spectrum_bar")! as HTMLCanvasElement;
  cv.width = Number(div_style.width.replace("px", ""));
  cv.height = Number(div_style.height.replace("px", ""));

  // オブジェクト、HTMLなど初期化
  sat = new sat_modules.Sat(
    content_root as HTMLElement,
    content_window as Window,
    cv,
    {},
    Number(
      (document.getElementById("word_inversion_lightness")! as HTMLInputElement)
        .value
    )
  );

  initializeHTML();
  setKeyboardPreference();

  // 初期描画
  sat.word.setOption(getWordOption());
  sat.word.invert(sat.content_root);
  setColoredQuery();

  // setTimeoutしないとウィンドウサイズが正しく取得されない？
  setTimeout(() => {
    sat.cv.updateData();
    sat.cv.draw();
  }, 100);
};

/**
 * キーボード操作の挙動を定義
 */
function setKeyboardPreference() {
  // ショートカットキーを追加
  // @ts-ignore
  hotkeys.filter = (event: any) => {
    return true; // contenteditableな要素の中でもショートカットを有効にする
  };

  hotkeys("ctrl+shift+f", (event: Event, _handler: any) => {
    event.preventDefault();
    function setCaretToEnd(target: HTMLElement) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      target.focus();
      range.detach();
    }
    const div = document.getElementById("word_query")!;
    div.click();
    setCaretToEnd(div);
  });
  if (document.getElementById("article_jump")) {
    hotkeys("ctrl+/", (event: Event, _handler: any) => {
      event.preventDefault();
      (document.getElementById("article_jump") as HTMLInputElement).value = "";
      document.getElementById("article_jump")?.focus();
    });
  }

  // backspaceでページが戻ることを防止＆コメント部分の削除処理等を定義
  // 以下のコードを参考に作成
  // https://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
  document.addEventListener("keydown", (e) => {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.keyCode === 8) {
      let doPrevent = true;
      const d = e.target as HTMLElement;

      if (d.id === "word_query") {
        doPrevent = false;
      } else if (d.isContentEditable) {
        doPrevent = false;
      } else if (d.tagName === "INPUT") {
        doPrevent = false;
      } else if (d.tagName === "TEXTAREA") {
        doPrevent = false;
      }

      if (doPrevent) {
        e.preventDefault();
        return;
      }
    }
  });
}

/**
 * イベントハンドラの設定など
 */
async function initializeHTML() {
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const color_picker = document.getElementById("color_picker")!;
    if (
      color_picker.style.display !== "none" &&
      !color_picker.contains(e.target)
    ) {
      color_picker.style.display = "none";
    }
  });

  // スペクトルバー関連
  document.getElementById("main")!.addEventListener("scroll", (e) => {
    sat.cv.draw();
  });

  window.addEventListener("resize", (_e) => {
    setTimeout(() => {
      const div_style = window.getComputedStyle(
        document.getElementById("spectrum")!
      );
      const cv = document.getElementById("spectrum_bar")! as HTMLCanvasElement;
      cv.width = Number(div_style.width.replace("px", ""));
      cv.height = Number(div_style.height.replace("px", ""));

      sat.cv.updateData();
      sat.cv.draw();
    }, 0);
  });

  sat.cv.element.onclick = (e: any) => {
    document
      .getElementById("main")!
      .scrollTo(
        0,
        e.offsetY *
        (document.getElementById("main")!.scrollHeight /
          sat.cv.element.height) -
        sat.cv.element.height / 2
      );
  };
  sat.cv.element.onmousedown = (e) => {
    sat.cv.element.onmousemove = (e: any) => {
      document
        .getElementById("main")!
        .scrollTo(
          0,
          e.offsetY *
          (document.getElementById("main")!.scrollHeight /
            sat.cv.element.height) -
          sat.cv.element.height / 2
        );
    };
    sat.cv.element.onmouseup = () => {
      sat.cv.element.onmousemove = null;
      sat.cv.element.onmouseup = null;
    };
  };
  sat.cv.element.onmouseover = () => {
    sat.cv.element.onmousemove = null;
  };

  // 上のメニューのイベントハンドラ
  document
    .getElementById("word_inversion_lightness")!
    .addEventListener("change", (e) => {
      // @ts-ignore
      localStorage.setItem("SAT_word_inversion_lightness", e.target.value);
      if (e.target instanceof HTMLInputElement) {
        sat.word.lightness = Number(e.target.value);
        sat.word.setOption(getWordOption());
        sat.word.invert(sat.content_root);
        setColoredQuery();
        sat.cv.updateData();
        sat.cv.draw();
      }
    });
  document.getElementById("word_query")!.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      showSpinner("ワード反転中...", 0, () => {
        sat.word.setOption(getWordOption());
        sat.word.invert(sat.content_root);
        setColoredQuery();
        sat.cv.updateData();
        sat.cv.draw();

        document.getElementById("word_query")!.blur();
      });
    }
  });


  // カラーピッカー関連
  document.getElementById("colormap")!.addEventListener("mouseout", (e) => {
    colorPickerMouseOut();
  });
  Array.from(
    document.getElementById("colormap")!.querySelectorAll("area")
  ).forEach((area) => {
    area.addEventListener("mouseover", (e) => {
      colorPickerMouseOver(area.alt);
    });
    area.addEventListener("click", (e) => {
      colorPickerClick(area.alt);
    });
  });

  // オブザーバ関係（サイズ変更の監視）
  const body_resize_observer = new MutationObserver((mutations) => {
    sat.cv.updateData();
    sat.cv.draw();
  });
  body_resize_observer.observe(document.body, {
    attributes: true,
    attributeFilter: [
      "offsetHeight",
      "clientHeight",
      "scrollHeight",
      "height",
      "offsetWidth",
      "clientWidth",
      "scrollWidth",
      "width",
    ],
  });

  const cv_resize_observer = new MutationObserver((mutations) => {
    sat.cv.updateData();
    sat.cv.draw();
  });
  cv_resize_observer.observe(document.getElementById("spectrum")!, {
    attributes: true,
    attributeFilter: [
      "offsetHeight",
      "clientHeight",
      "scrollHeight",
      "height",
      "offsetWidth",
      "clientWidth",
      "scrollWidth",
      "width",
    ],
  });

  // 簡易ワード反転のクリックイベント（color_pickerのクリックイベント時にこのイベントの実行を中止させたいので、focusでなくclickイベントを選択）
  document.getElementById("word_query")!.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    e.target.querySelectorAll("span").forEach((span) => {
      span.className = "";
      span.onclick = null;
    });
  });

  // ワード設定ボックスへの貼り付け時に書式を消す
  document.getElementById("word_query")!.addEventListener("paste", (e: any) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  });

  // マーカー色設定などのロード
  if (localStorage.getItem("SAT_word_inversion_lightness")) {
    (
      document.getElementById("word_inversion_lightness")! as HTMLInputElement
    ).value = localStorage.getItem("SAT_word_inversion_lightness")!;
    sat.word.lightness = Number(
      localStorage.getItem("SAT_word_inversion_lightness")!
    );
  }
  // TODO!
    document
      .getElementById("fusoku_display")
      ?.addEventListener("click", () => {
        if (!document.querySelector("section.SupplProvision")) return;
        const flag =
          (document.querySelector("section.SupplProvision")! as HTMLElement).style.display === "none";
        if (flag) {
          Array.from(document.querySelectorAll("section.SupplProvision")).forEach(
            (SupplProvision) => {
              (SupplProvision as HTMLElement).style.display = "";
            }
          );
        } else {
          Array.from(document.querySelectorAll("section.SupplProvision")).forEach(
            (SupplProvision) => {
              (SupplProvision as HTMLElement).style.display = "none";
            }
          );
        }

        // パンくずナビゲーションを再初期化（附則の表示状態が変わったため）
        if ((window as any).initializeBreadcrumbNavigation) {
          (window as any).initializeBreadcrumbNavigation();
        }

        sat.cv.updateData();
      });
}

/*
 * ====================== ワード反転関連 ======================
 */

/**
 * #word_query内に入力されたクエリからワード反転のオプションを生成
 * @return {object} satオブジェクトに渡すワード反転のオプション
 */
function getWordOption() {
  const query = document
    .getElementById("word_query")!
    .innerText.trim()
    .replace(/[\r\n]+/g, " ");
  if (query === "" || /^\s+$/.test(query)) {
    return {};
  }

  const word_arr: string[][] = query.split(/\s+/).map((word) => {
    const slash_match = word.match(/(^\/|[^\\]\/|\/$)/g);
    if (slash_match && slash_match.length > 0 && slash_match.length % 2 === 0) {
      // クエリの最小単位を求める再帰関数（先頭から順に最小単位を切り取っていく）

      return getQueryUnitArr(word, []);
    } else {
      return word.split(/[+＋]/g);
    }
  });

  // 反転ワード情報を更新
  const colors = sat.word.getWordColors(word_arr.length);

  const word_option: { [color_id: string]: sat_modules.WordOption } = {};
  word_arr.forEach((words: string[], i: number) => {
    words.forEach((word: string) => {
      if (!word_option[i]) {
        word_option[i] = { words: [], color: "" };
      }
      if (word.substr(0, 1) !== "/") {
        word_option[i]!.words.push(word.replace(/_/g, " "));
      } else {
        word_option[i]!.words.push(word);
      }

      word_option[i]!.color = colors[i]!;
    });
  });

  return word_option;
}

function getQueryUnitArr(word: string, acc: string[]): string[] {
  if (word.substr(0, 1) !== "/") {
    // 先頭は正規表現でない -> 最先の+を見つけてそこで区切る
    const pos_plus = word.indexOf("+");
    if (pos_plus === -1) {
      acc.push(word);
      return acc;
    } else {
      acc.push(word.substring(0, pos_plus));
      return getQueryUnitArr(word.substring(pos_plus + 1), acc);
    }
  } else {
    // 先頭は正規表現 -> 最先の/（ただし\/は除外）を見つけてそこで区切る
    const mt = word.match(/[^\\]\/[dgimsuy]*/)!;
    if (!mt) return acc; // 何かがおかしい
    acc.push(word.substring(0, mt.index! + mt[0]!.length));

    if (word.length === mt.index! + mt[0]!.length) {
      return acc;
    } else {
      return getQueryUnitArr(
        word.substring(mt.index! + mt[0]!.length + 1),
        acc
      );
    }
  }
}

/**
 * #word_query内に、キーワードを各反転色で反転させたHTMLをセット
 */
function setColoredQuery() {
  const query_div = document.getElementById("word_query")!;
  query_div.innerHTML = "";

  Object.keys(sat.word.option).forEach((color_id) => {
    sat.word.option[color_id]!.words.forEach((word, j) => {
      const span = document.createElement("span");
      span.innerText = word.replace(/ /g, "_");
      span.setAttribute("mode", "word_inversion");
      span.setAttribute("color_id", color_id);
      span.classList.add("query_unit");
      span.classList.add(`word_inversion_class${color_id}`);
      span.onclick = (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        const color_picker = document.getElementById("color_picker")!;
        color_picker.setAttribute(
          "color_id",
          e.target.getAttribute("color_id")!
        );
        color_picker.style.display = "block";
        color_picker.style.left = `${sat.getOffset(e.target, document.body).offset_left +
          e.target.offsetWidth / 2 -
          document.getElementById("color_picker")!.offsetWidth / 2
          }px`;
        color_picker.setAttribute("mode", "word_inversion");
        e.preventDefault();
        e.stopPropagation();
      };
      query_div.appendChild(span);
      if (j !== sat.word.option[color_id]!.words.length - 1) {
        query_div.appendChild(document.createTextNode("+"));
      }
    });
    query_div.appendChild(document.createTextNode(" "));
  });
}

/**
 * color pickerのマウスオーバーイベント
 * @param {string} color_code マウスオーバーされたカラーコード
 */
// @ts-ignore
function colorPickerMouseOver(color_code: string) {
  const color_id = document
    .getElementById("color_picker")!
    .getAttribute("color_id");
  Array.from(document.getElementById("word_query")!.querySelectorAll("span"))
    .filter((span) => {
      return span.getAttribute("color_id") === color_id;
    })
    .forEach((span) => {
      span.style.setProperty("background-color", color_code, "important");
      span.style.color = sat.word.calcWordColor(color_code);
    });
}

/**
 * color pickerのマウスアウトイベント
 */
// @ts-ignore
function colorPickerMouseOut() {
  const color_id = document
    .getElementById("color_picker")!
    .getAttribute("color_id");
  Array.from(document.getElementById("word_query")!.querySelectorAll("span"))
    .filter((span) => {
      return span.getAttribute("color_id") === color_id;
    })
    .forEach((span) => {
      span.removeAttribute("style");
    });
}

/**
 * color pickerがクリックされた時に実行。色を変更して反転処理を行う。
 * @param {string} color_code クリックされたカラーコード
 */
// @ts-ignore
function colorPickerClick(color_code: string) {
  color_code = color_code.toLowerCase();

  const color_id = document
    .getElementById("color_picker")!
    .getAttribute("color_id")!;

  showSpinner("ワード反転中...", 0, () => {
    sat.word.setColor(Number(color_id), color_code);
    sat.word.invert(sat.content_root);
    setColoredQuery();
    sat.cv.updateData();
    sat.cv.draw();
  });

  document.getElementById("color_picker")!.style.display = "none";
}

/*
 * ====================== その他 ======================
 */

/**
 * スピナー画面を表示して実行
 */
function showSpinner(message: string, msec: number, exec_func: any) {
  document.getElementById("loading_message")!.innerHTML = message;
  const spinner = document.getElementById("spinner")!;
  spinner.classList.add("visible");
  new Promise((resolve, reject) => {
    setTimeout(() => {
      exec_func();
      resolve(null);
    }, msec);
  }).then(() => {
    spinner.classList.remove("visible");
  });
}

// initialize関数をグローバルに公開
window.initialize = initialize;