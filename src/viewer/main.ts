"use strict";
import * as sat_modules from "./sat";
// @ts-ignore
import { getSelection } from "rangy2/bundles/index.umd";
// Split.js を削除して自作の幅調整機能を実装
// @ts-ignore
import hotkeys from "hotkeys-js/dist/hotkeys";

let sat: sat_modules.Sat;
let commentVisible: boolean = true;
let contentWidth: number = 70; // 本文領域の幅（%）
let isResizing: boolean = false;

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
    ),
    (document.getElementById("block_mode")! as HTMLInputElement).checked,
    (document.getElementById("auto_sieve_mode")! as HTMLInputElement).checked
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
    sat.comment.sort();
    sat.comment.arrange();
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

  // egov版のショートカットキー
  hotkeys("ctrl+b", (event: Event, _handler: any) => {
    event.preventDefault();
    decorate("bold");
  });
  hotkeys("ctrl+u", (event: Event, _handler: any) => {
    event.preventDefault();
    decorate("underline");
  });
  hotkeys("ctrl+h", (event: Event, _handler: any) => {
    event.preventDefault();
    highlight();
    sat.content_window.getSelection()?.removeAllRanges();
  });
  hotkeys("ctrl+d", (event: Event, _handler: any) => {
    event.preventDefault();
    dehighlight();
    sat.content_window.getSelection()?.removeAllRanges();
  });
  hotkeys("ctrl+1", (event: Event, _handler: any) => {
    event.preventDefault();
    comment();
  });

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

        const div_element = window
          .getSelection()
          ?.anchorNode?.parentElement?.closest("div.comment") as HTMLElement;

        // コメントが空のときにBackspaceが押されたら、コメントを削除
        if (
          div_element &&
          (div_element.innerText === "\n" || div_element.innerText === "")
        ) {
          doPrevent = true;

          sat.comment.remove(div_element.getAttribute("comment_id")!);
          sat.cv.updateData();
          sat.cv.draw();
          sat.comment.sort();
          sat.comment.arrange();
        }
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
    const color_picker_comment = document.getElementById(
      "color_picker_comment"
    )!;
    if (
      color_picker_comment.style.display !== "none" &&
      !color_picker_comment.contains(e.target)
    ) {
      color_picker_comment.style.display = "none";
      color_picker.setAttribute("comment_id", "");
    }
  });

  // イベントハンドラ追加（コメント側）
  Array.from(document.querySelectorAll("div.comment")).forEach(
    (div_element) => {
      sat.comment.linkify(div_element);
      div_element.addEventListener("mouseover", (e) => {
        sat.comment.onMouseOver(div_element.getAttribute("comment_id")!);
      });
      div_element.addEventListener("input", (e) => {
        sat.comment.onInput();
      });
      div_element.addEventListener("blur", (e) => {
        sat.comment.onBlur(e);
      });
      div_element.addEventListener("paste", (e) => {
        sat.comment.onPaste(e);
      });

      div_element.addEventListener("mouseout", (e) => {
        // 子要素への移動であれば無視
        if (
          e instanceof MouseEvent &&
          e.relatedTarget instanceof HTMLElement &&
          e.relatedTarget.parentElement !== null &&
          e.relatedTarget.parentElement.closest(
            `div.comment[comment_id="${div_element.getAttribute(
              "comment_id"
            )}"]`
          ) !== null
        ) {
          return;
        }
        sat.comment.onMouseOut(div_element.getAttribute("comment_id")!);
      });
    }
  );
  Array.from(
    document.getElementById("comment_svg")!.querySelectorAll("polygon")
  ).forEach((polygon_element) => {
    polygon_element.addEventListener("click", (e) => {
      if (e.target instanceof SVGPolygonElement) {
        sat.comment.onPolygonClick(e.target.getAttribute("comment_id")!);
      }
    });
  });

  // イベントハンドラ追加（被コメント側）
  Array.from(sat.content_root.querySelectorAll("span.commented")).forEach(
    (span_element) => {
      span_element.addEventListener("mouseover", (e) => {
        sat.comment.onMouseOver(span_element.getAttribute("comment_id")!);
      });

      span_element.addEventListener("mouseout", (e) => {
        // 子要素への移動であれば無視
        if (
          e instanceof MouseEvent &&
          e.relatedTarget instanceof HTMLElement &&
          e.relatedTarget.parentElement !== null &&
          e.relatedTarget.parentElement.closest(
            `span.commented[comment_id="${span_element.getAttribute(
              "comment_id"
            )}"]`
          ) !== null
        ) {
          return;
        }
        sat.comment.onMouseOut(span_element.getAttribute("comment_id")!);
      });
    }
  );

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

      // 何故か、sat.cv.updateData();を先にしないとsat.comment.sort()とarrange()が機能しない。。。
      sat.cv.updateData();
      sat.cv.draw();
      sat.comment.sort();
      sat.comment.arrange();
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
  document.getElementById("block_mode")!.addEventListener("change", (e) => {
    // @ts-ignore
    localStorage.setItem("SAT_block_mode", e.target.checked.toString());

    showSpinner("ワード反転中...", 10, () => {
      if (e.target instanceof HTMLInputElement && e.target.checked) {
        sat.word.block_mode = true;
        sat.word.invert(sat.content_root);
        sat.cv.updateData();
        sat.cv.draw();
      } else {
        sat.word.block_mode = false;
        sat.word.invert(sat.content_root);
        sat.cv.updateData();
        sat.cv.draw();
      }
    });
  });
  document
    .getElementById("auto_sieve_mode")!
    .addEventListener("change", (e) => {
      // @ts-ignore
      localStorage.setItem("SAT_auto_sieve_mode", e.target.checked.toString());
      if (e.target instanceof HTMLInputElement) {
        sat.word.auto_sieve_mode = e.target.checked;
      }
    });
  document.getElementById("btn_bold")!.addEventListener("click", () => {
    decorate("bold");
  });
  document.getElementById("btn_underline")!.addEventListener("click", () => {
    decorate("underline");
  });
  document.getElementById("btn_highlight")!.addEventListener("click", () => {
    highlight();
    sat.content_window.getSelection()?.removeAllRanges();
  });
  document
    .getElementById("btn_select_highlight_color")!
    .addEventListener("click", (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const color_picker = document.getElementById("color_picker")!;
      color_picker.setAttribute("mode", "highlight");
      color_picker.style.display = "block";
      color_picker.style.left = `${sat.getOffset(e.target, document.body).offset_left +
        e.target.offsetWidth / 2 -
        document.getElementById("color_picker")!.offsetWidth / 2
        }px`;
      e.preventDefault();
      e.stopPropagation();
    });
  document
    .getElementById("btn_select_comment_color")!
    .addEventListener("click", (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const color_picker = document.getElementById("color_picker")!;
      color_picker.setAttribute("mode", "comment");
      color_picker.style.display = "block";
      color_picker.style.left = `${sat.getOffset(e.target, document.body).offset_left +
        e.target.offsetWidth / 2 -
        document.getElementById("color_picker")!.offsetWidth / 2
        }px`;
      e.preventDefault();
      e.stopPropagation();
    });
  document.getElementById("btn_erase")!.addEventListener("click", (e) => {
    dehighlight();
    sat.content_window.getSelection()?.removeAllRanges();
  });
  document.getElementById("btn_comment")!.addEventListener("click", () => {
    comment();
  });
  document.getElementById("btn_editUnlock")!.addEventListener("click", () => {
    document.getElementById("content")!.contentEditable = "true";
    document.getElementById("li_editUnlock")!.classList.add("hidden");
    document.getElementById("li_editLock")!.classList.remove("hidden");
  });
  document.getElementById("btn_editLock")!.addEventListener("click", () => {
    document.getElementById("content")!.contentEditable = "false";
    document.getElementById("li_editLock")!.classList.add("hidden");
    document.getElementById("li_editUnlock")!.classList.remove("hidden");
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
  const comment_removal_observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLSpanElement) {
          if (node.classList.contains("commented")) {
            const comment_id = node.getAttribute("comment_id")!;
            const span_with_same_comment_id = document
              .getElementById("content")!
              .querySelector(`span.commented[comment_id="${comment_id}"]`);
            if (!span_with_same_comment_id) {
              sat.comment.remove(comment_id);
            }
            sat.cv.updateData();
            sat.cv.draw();
            sat.comment.sort();
            sat.comment.arrange();
          }
        }
      });
    });
  });
  comment_removal_observer.observe(document.getElementById("content")!, {
    childList: true,
    subtree: true,
  });

  const comment_resize_observer = new MutationObserver((mutations) => {
    sat.comment.arrange();
  });
  comment_resize_observer.observe(document.getElementById("comment_div")!, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    attributeFilter: ["offsetHeight", "clientHeight", "scrollHeight", "height"],
  });

  const body_resize_observer = new MutationObserver((mutations) => {
    sat.cv.updateData();
    sat.cv.draw();
    sat.comment.sort();
    sat.comment.arrange();
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
    sat.comment.sort();
    sat.comment.arrange();
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

  // 本文部分のイベントハンドラ登録
  document.getElementById("content")!.addEventListener("input", (e) => {
    sat.comment.arrange();
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

  // コメント表示状態の復元
  const savedCommentVisible = localStorage.getItem("SAT_comment_visible");
  if (savedCommentVisible !== null) {
    commentVisible = savedCommentVisible === "true";
  }

  // 幅設定の復元
  const savedContentWidth = localStorage.getItem("SAT_content_width");
  if (savedContentWidth !== null) {
    contentWidth = parseFloat(savedContentWidth);
  }

  // 自作リサイズ機能の初期化
  initializeResizer();

  // パネルサイズの初期設定
  updatePanelSizes();

  // マーカー色設定などのロード
  if (localStorage.getItem("SAT_word_inversion_lightness")) {
    (
      document.getElementById("word_inversion_lightness")! as HTMLInputElement
    ).value = localStorage.getItem("SAT_word_inversion_lightness")!;
    sat.word.lightness = Number(
      localStorage.getItem("SAT_word_inversion_lightness")!
    );
  }
  if (
    (
      document.getElementById("block_mode")! as HTMLInputElement
    ).checked.toString() !== localStorage.getItem("SAT_block_mode")
  ) {
    document.getElementById("block_mode")!.click();
  }
  if (
    (
      document.getElementById("auto_sieve_mode")! as HTMLInputElement
    ).checked.toString() !== localStorage.getItem("SAT_auto_sieve_mode")
  ) {
    document.getElementById("auto_sieve_mode")!.click();
  }
  let highlight_color: string | null, comment_color: string | null;
  if ((highlight_color = localStorage.getItem("SAT_highlight_color"))) {
    const btn_highlight = document.getElementById("btn_highlight")!;
    btn_highlight.setAttribute("highlightColor", highlight_color);
    btn_highlight.style.backgroundColor = highlight_color;
  }
  if ((comment_color = localStorage.getItem("SAT_comment_color"))) {
    const btn_comment = document.getElementById("btn_comment")!;
    btn_comment.setAttribute("commentColor", comment_color);
    btn_comment.style.backgroundColor = comment_color;
  }

  // コメント表示切り替えボタンのイベント
  document
    .getElementById("comment_toggle")
    ?.addEventListener("click", () => {
      toggleCommentVisibility();
    });

  // egov版の逐条関係のイベント
  Array.from(document.querySelectorAll("details")).forEach((details) => {
      const commentSVG = document.getElementById("comment_svg")!;
      const commentDiv = document.getElementById("comment_div")!;
      details.addEventListener("toggle", (e) => {
        Array.from(
          new Set(
            Array.from(details.querySelectorAll("span.commented")).map(
              (span) => {
                return span.getAttribute("comment_id");
              }
            )
          )
        ).forEach((comment_id) => {
          if (details.open) {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "";
          } else {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "none";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "none";
          }
          sat.cv.updateData();
          sat.comment.sort();
          sat.comment.arrange();
        });
      });
    });

    document
      .getElementById("chikujo_display")
      ?.addEventListener("click", () => {
        const flag =
          document.querySelector("details")!.style.display === "none";
        if (flag) {
          Array.from(document.querySelectorAll("details")).forEach(
            (details) => {
              details.style.display = "";
            }
          );
        } else {
          Array.from(document.querySelectorAll("details")).forEach(
            (details) => {
              details.style.display = "none";
            }
          );
        }

        const commentSVG = document.getElementById("comment_svg")!;
        const commentDiv = document.getElementById("comment_div")!;
        const content = document.getElementById("content")!;
        Array.from(
          new Set(
            Array.from(document.querySelectorAll("details span.commented")).map(
              (span) => {
                return span.getAttribute("comment_id");
              }
            )
          )
        ).forEach((comment_id) => {
          const details = content
            .querySelector(`[comment_id="${comment_id}"]`)
            ?.closest("details");
          if (details && !details.open) return;
          if (flag) {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "";
          } else {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "none";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "none";
          }
        });


        sat.cv.updateData();
        sat.comment.sort();
        sat.comment.arrange();
      });

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

        const commentSVG = document.getElementById("comment_svg")!;
        const commentDiv = document.getElementById("comment_div")!;
        // const content = document.getElementById("content")!;
        Array.from(
          new Set(
            Array.from(document.querySelectorAll("SupplProvision span.commented")).map(
              (span) => {
                return span.getAttribute("comment_id");
              }
            )
          )
        ).forEach((comment_id) => {
          // const SupplProvision = content
          //   .querySelector(`[comment_id="${comment_id}"]`)
          //   ?.closest("section.SupplProvision");
          // if (SupplProvision && !SupplProvision.open) return;
          if (flag) {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "";
          } else {
            (
              commentDiv.querySelector(
                `div.comment[comment_id="${comment_id}"]`
              )! as HTMLDivElement
            ).style.display = "none";
            (
              commentSVG.querySelector(
                `polygon[comment_id="${comment_id}"]`
              )! as SVGPolygonElement
            ).style.display = "none";
          }
        });


        sat.cv.updateData();
        sat.comment.sort();
        sat.comment.arrange();
      });
}

/*
 * ====================== ダウンロード、ロード関連 ======================
 */

/*
 * ====================== コメント表示切り替え関連 ======================
 */

/**
 * 領域の幅を設定する
 */
function updatePanelSizes() {
  const content = document.getElementById("content")!;
  const commentContainer = document.getElementById("comment_container")!;
  const resizer = document.getElementById("resizer")!;

  if (commentVisible) {
    content.style.width = `${contentWidth}%`;
    commentContainer.style.width = `${100 - contentWidth}%`;
    commentContainer.style.display = "block";
    resizer.style.display = "block";
  } else {
    content.style.width = "100%";
    commentContainer.style.width = "0%";
    commentContainer.style.display = "none";
    resizer.style.display = "none";
  }
}

/**
 * リサイザーの初期化
 */
function initializeResizer() {
  const resizer = document.createElement("div");
  resizer.id = "resizer";
  resizer.className = "resizer";

  // contentとcomment_containerの間にリサイザーを配置
  const contenteditable_container = document.getElementById("contenteditable_container")!;
  const content = document.getElementById("content")!;
  const commentContainer = document.getElementById("comment_container")!;

  // contentの後、comment_containerの前に配置
  contenteditable_container.insertBefore(resizer, commentContainer);

  let startX: number;
  let startWidth: number;

  resizer.addEventListener("mousedown", (e) => {
    if (!commentVisible) return;

    isResizing = true;
    startX = e.clientX;
    startWidth = contentWidth;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    resizer.style.cursor = "col-resize";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing || !commentVisible) return;

    const container = document.getElementById("text")!;
    const containerWidth = container.offsetWidth;
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / containerWidth) * 100;

    let newWidth = startWidth + deltaPercent;

    // 最小・最大幅の制限
    newWidth = Math.max(30, Math.min(80, newWidth));

    contentWidth = newWidth;
    updatePanelSizes();

    // リアルタイムでコメント位置を調整
    sat.comment.arrange();
  }

  function handleMouseUp() {
    if (!isResizing) return;

    isResizing = false;
    resizer.style.cursor = "";
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // 最終的な描画更新
    setTimeout(() => {
      sat.cv.updateData();
      sat.cv.draw();
      sat.comment.sort();
      sat.comment.arrange();
    }, 0);

    // 幅設定をlocalStorageに保存
    localStorage.setItem("SAT_content_width", contentWidth.toString());
  }
}

/**
 * コメント領域の表示・非表示を切り替える
 */
function toggleCommentVisibility() {
  commentVisible = !commentVisible;
  localStorage.setItem("SAT_comment_visible", commentVisible.toString());

  updatePanelSizes();

  // スペクトルバーの再描画
  setTimeout(() => {
    sat.cv.updateData();
    sat.cv.draw();
    sat.comment.sort();
    sat.comment.arrange();
  }, 100);
}

/*
 * ====================== decoration, comment関連 ======================
 */

/**
 * 選択された領域の修飾
 * @param {string} class_name 修飾に対応するclassの名前
 */
function decorate(class_name: string) {
  const selection = sat.content_window.getSelection();
  if (!selection) return;
  // 選択範囲がsat.content_rootに含まれていなければ終了
  if (
    !sat.content_root.contains(selection.anchorNode) ||
    !sat.content_root.contains(selection.focusNode)
  ) {
    return;
  }
  sat.decoration.add(class_name);
}

/**
 * 選択された領域のハイライト
 */
function highlight() {
  const color_code = document
    .getElementById("btn_highlight")!
    .getAttribute("highlightColor")!;

  const selection = sat.content_window.getSelection();
  if (!selection) return;

  // 選択範囲がsat.content_rootに含まれていなければ終了
  if (
    !sat.content_root.contains(selection.anchorNode) ||
    !sat.content_root.contains(selection.focusNode)
  ) {
    return;
  }
  sat.decoration.highlight(color_code);
}

/**
 * 選択された領域のハイライト削除
 */
function dehighlight() {
  sat.decoration.dehighlight();
}

/**
 * 選択された領域へのコメントを追加
 */
function comment() {
  const color_code = document
    .getElementById("btn_comment")!
    .getAttribute("commentColor")!;

  const selection = sat.content_window.getSelection();
  if (!selection) return;

  // 選択範囲がsat.content_rootに含まれていなければ終了
  if (
    !sat.content_root.contains(selection.anchorNode) ||
    !sat.content_root.contains(selection.focusNode)
  ) {
    return;
  }

  // Selectionにコメントが含まれている場合、コメントを追加しない
  const sel = getSelection(sat.content_window);
  if (sel.rangeCount) {
    if (
      sel.getRangeAt(0).getNodes([], (node: Node) => {
        return node instanceof Element && node.classList.contains("commented");
      }).length > 0
    ) {
      alert("同じ領域に複数のコメントをつけることはできません。");
      return;
    }
    if (
      sel
        .getRangeAt(0)
        .commonAncestorContainer.parentElement.closest("span.commented") !==
      null
    ) {
      alert("同じ領域に複数のコメントをつけることはできません。");
      return;
    }
  }

  // コメント非表示時にコメントを作成した場合、表示状態に切り替え
  if (!commentVisible) {
    toggleCommentVisibility();
  }

  sat.comment.addComment(color_code);
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
  const mode = document.getElementById("color_picker")!.getAttribute("mode");
  if (mode === "highlight") {
    return;
  } else if (mode === "comment") {
    const comment_id = document
      .getElementById("color_picker")!
      .getAttribute("comment_id");

    if (comment_id) {
      const comment_div = document
        .getElementById("comment_div")!
        .querySelector<HTMLDivElement>(
          `div.comment[comment_id="${comment_id}"]`
        )!;

      const polygon_element = document
        .getElementById("comment_svg")!
        .querySelector<SVGPolygonElement>(
          `polygon[comment_id="${comment_id}"]`
        )!;

      const commented_span_arr = document.querySelectorAll<HTMLSpanElement>(
        `span.commented[comment_id="${comment_id}"]`
      );

      comment_div.style.backgroundColor = color_code;
      comment_div.style.borderColor = color_code;
      polygon_element.style.fill = color_code;
      polygon_element.style.stroke = color_code;
      commented_span_arr.forEach((span) => {
        span.style.backgroundColor = color_code;
        span.style.borderColor = color_code;
      });
    }
  } else {
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
}

/**
 * color pickerのマウスアウトイベント
 */
// @ts-ignore
function colorPickerMouseOut() {
  const mode = document.getElementById("color_picker")!.getAttribute("mode");
  if (mode === "highlight") {
    return;
  } else if (mode === "comment") {
    const comment_id = document
      .getElementById("color_picker")!
      .getAttribute("comment_id");

    if (comment_id) {
      const comment_div = document
        .getElementById("comment_div")!
        .querySelector<HTMLDivElement>(
          `div.comment[comment_id="${comment_id}"]`
        )!;
      const polygon_element = document
        .getElementById("comment_svg")!
        .querySelector<SVGPolygonElement>(
          `polygon[comment_id="${comment_id}"]`
        )!;
      const commented_span_arr = document.querySelectorAll<HTMLSpanElement>(
        `span.commented[comment_id="${comment_id}"]`
      );
      const color_code = document
        .getElementById("color_picker")!
        .getAttribute("comment_color")!;
      comment_div.style.backgroundColor = color_code;
      comment_div.style.borderColor = color_code;
      polygon_element.style.fill = color_code;
      polygon_element.style.stroke = color_code;
      commented_span_arr.forEach((span) => {
        span.style.backgroundColor = color_code;
        span.style.borderColor = color_code;
      });
    }
  } else {
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
}

/**
 * color pickerがクリックされた時に実行。色を変更して反転処理を行う。
 * @param {string} color_code クリックされたカラーコード
 */
// @ts-ignore
function colorPickerClick(color_code: string) {
  color_code = color_code.toLowerCase();

  const mode = document.getElementById("color_picker")!.getAttribute("mode");
  if (mode === "highlight") {
    localStorage.setItem("SAT_highlight_color", color_code);
    const btn_highlight = document.getElementById("btn_highlight")!;
    btn_highlight.setAttribute("highlightColor", color_code);
    btn_highlight.style.backgroundColor = color_code;
  } else if (mode === "comment") {
    localStorage.setItem("SAT_comment_color", color_code);
    document.getElementById("btn_comment")!.style.backgroundColor = color_code;
    document
      .getElementById("btn_comment")!
      .setAttribute("commentColor", color_code);
    document.getElementById("color_picker")!.setAttribute("comment_id", "");
    sat.cv.updateData();
    sat.cv.draw();
  } else {
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
  }
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