import Mark from "mark.js/dist/mark";

export type WordOption = {
  words: string[];
  color: string;
};

export class Sat {
  content_root: HTMLElement; // コンテンツを含む要素を指定
  content_window: Window; // コンテンツを含むウィンドウを指定

  word: SatWord; // ワード反転を扱うオブジェクト
  cv: SatCanvas; // スペクトルバーの描画を扱うオブジェクト

  constructor(
    content_root: HTMLElement,
    content_window: Window,
    cv: HTMLCanvasElement,
    selected_color: { [key: string]: string },
    lightness: number
  ) {
    this.content_root = content_root;
    this.content_window = content_window;

    this.word = new SatWord(
      this,
      selected_color,
      lightness
    );
    this.cv = new SatCanvas(this, cv);
  }

  /**
   * 対応するspan要素を削除。ただし、複数のクラスや属性があった場合は、指定したクラスや属性だけ削除してspanを残す
   * @param {span_element} el 削除したいspan
   * @param {class_name_arr} array 削除したいクラス名の配列
   * @param {attribute_name_arr} array 削除したい属性名の配列
   */
  removeSpan = (
    span: HTMLSpanElement,
    class_name_arr: string[],
    attribute_name_arr: string[]
  ): void => {
    class_name_arr.forEach((class_name): void => {
      span.classList.remove(class_name);
    });

    attribute_name_arr.forEach((attribute_name): void => {
      span.removeAttribute(attribute_name);
    });

    // if (span.classList.length === 0 && span.getAttribute("style") === null) {
    if (span.classList.length === 0) {
      const parent = span.parentElement!;
      span.replaceWith(...Array.from(span.childNodes));
      parent.normalize();
    }
  };

  /**
   * container要素におけるelement要素のxy座標を取得
   * @return { offset_top: x座標, offset_left: y座標 }
   */
  getOffset = (
    element: HTMLElement,
    container: HTMLElement
  ): { offset_top: number; offset_left: number } => {
    let offset_top = element.offsetTop;
    let offset_left = element.offsetLeft;
    let offset_parent = element.offsetParent as HTMLElement;

    while (offset_parent !== container && offset_parent !== null) {

      offset_top +=
        offset_parent.offsetTop +
        Number(
          this.content_window
            .getComputedStyle(offset_parent)
            .borderWidth.match(/^[0-9]+/)![0]
        ) *
        2; // TODO ここは怪しいかも
      offset_left += offset_parent.offsetLeft;
      offset_parent = offset_parent.offsetParent as HTMLElement;

    }
    return { offset_top: offset_top, offset_left: offset_left };
  };

  /**
   * RGBをカラーコードに変換
   * https://decks.hatenadiary.org/entry/20100907/1283843862
   * @param col "rgb(R, G, B)"の形式の文字列
   * @return "#000000"形式のカラーコード
   */
  rgbTo16 = (col: string): string => {
    return (
      "#" +
      col
        .match(/\d+/g)
        ?.map((a: string) => {
          return ("0" + parseInt(a).toString(16)).slice(-2);
        })
        .join("")
    );
  };

  /**
   * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   {number}  h       The hue
   * @param   {number}  s       The saturation
   * @param   {number}  l       The lightness
   * @return  {Array}           The RGB representation
   */
  hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    return (
      "#" +
      `0${Math.floor(r * 255).toString(16)}`.slice(-2) +
      `0${Math.floor(g * 255).toString(16)}`.slice(-2) +
      `0${Math.floor(b * 255).toString(16)}`.slice(-2)
    );
  }

  /**
   * 要素のセレクタを取得（参考：https://akabeko.me/blog/2015/06/get-element-selector/）
   * @param {object} el セレクタを取得したいエレメント
   * @returns {string} セレクタ
   */
  getSelectorFromElement = (el: any): string[] => {
    const names = [];

    while (el) {
      let name = el.nodeName.toLowerCase();
      if (el.id) {
        name += "#" + el.id;
        names.unshift(name);
        break;
      }

      const index = this.getSiblingElementsIndex(el, name);
      name += ":nth-of-type(" + index + ")";

      names.unshift(name);
      el = el.parentNode;
    }

    return names;
  };

  /**
   * 親要素に対して何番目の子要素かを取得
   * https://github.com/akabekobeko/examples-web-app/tree/get-element-selector/get-element-selector
   * @param el 調べたい子要素
   * @return index 何番目かを表す数値
   */

  getSiblingElementsIndex = (el: Element, name: string): number => {
    let index = 1;
    let sib = el;

    while ((sib = sib.previousElementSibling!)) {
      if (sib.nodeName.toLowerCase() === name) {
        ++index;
      }
    }

    return index;
  };
}

class SatWord {
  sat: Sat;
  option: { [key: string]: WordOption } = {};
  selected_color: { [key: string]: string } = {};
  lightness: number;

  constructor(
    sat: Sat,
    selected_color: { [key: string]: string },
    lightness: number
  ) {
    this.sat = sat;
    this.selected_color = selected_color;
    this.lightness = lightness;
  }

  setOption = (option: { [key: string]: WordOption }): void => {
    this.option = option;

    // 手動で選択した色があればそれをセットする
    Object.keys(this.option).forEach((color_id) => {
      if (this.option[color_id] && this.selected_color[color_id]) {
        this.option[color_id]!.color = this.selected_color[color_id]!;
      }
    });
  };

  setColor = (color_id: number, color: string): void => {
    this.selected_color[color_id] = color;
    if (this.option[color_id]) this.option[color_id]!.color = color;
  };
  invert(root: HTMLElement): void {
    // ワード反転解除
    this.clear(root);

    const mark_instance = new Mark(root);
    const mark_options = {
      element: "span",
      accuracy: "partially",
      separateWordSearch: false,
      acrossElements: true,
      ignoreJoiners: true,
      ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),
      each: (elem: HTMLElement) => {
        elem.classList.add("word_inversion");
      },
      className: "",
    };

    const colorStyle = document.createElement("style");
    colorStyle.type = "text/css";
    colorStyle.id = "SAT_word_inversion";

    this.sat.content_window.document.head.prepend(colorStyle);

    for (const color_id in this.option) {
      mark_options.className = `word_inversion_class${Number(color_id)}`;
      const color_code = this.option[color_id]!.color;

      colorStyle.sheet!.insertRule(
        `span.word_inversion_class${color_id}, span.word_inversion_class${color_id} * {background-color: ${color_code} !important; color: ${this.calcWordColor(color_code)} !important}`,
        0
      );

      this.option[color_id]!.words.forEach((word: string) => {
        if (/^\/.*\/[dgimsuy]*$/.test(word)) {
          // 元々正規表現の場合
          let re_option = "";
          if (word.match(/([dgimsuy]+)$/)) {
            re_option = word.match(/([dgimsuy]+)$/)![0]!;
            word = word.slice(0, -re_option.length);
          }
          const reg_ex = new RegExp(word.slice(1, -1), re_option);
          mark_instance.markRegExp(reg_ex, mark_options);
        } else {
          // 正規表現でない場合
          mark_instance.mark(word, mark_options);
          // 条文番号検索（例: a1-2,5-7）
          if (/^a[0-9]+(-[0-9]+)*(,[0-9]+(-[0-9]+)*)?$/.test(word)) {
            Array.from(
              this.sat.content_root.querySelectorAll("span[article_num]")
            ).forEach((span) => {
              const searchArticleNum = word.substring(1);
              const spanArticleNum = span.getAttribute("article_num")!;
              if (
                !/^[0-9]+(-[0-9]+)*(,[0-9]+(-[0-9]+)*)?$/.test(spanArticleNum)
              ) {
                return;
              }
              if (this.hasIntersection(searchArticleNum, spanArticleNum)) {
                span.classList.add(`word_inversion`);
                span.classList.add(`word_inversion_class${color_id}`);
                span.setAttribute("data-markjs", "true");
              }
            });
          }
        }
      });
    }

    // 逐条がある場合、ワード反転されている逐条を自動で開く
    if (
      this.sat.content_root.querySelector("details")?.style.display !== "none"
    ) {
      Array.from(this.sat.content_root.querySelectorAll("details")).forEach(
        (details) => {
          if (
            details.querySelector("span.word_inversion") &&
            details.open === false
          ) {
            details.open = true;
          }
        }
      );
    }
  }
  clear = (root: HTMLElement): void => {
    Array.from(
      root.querySelectorAll<HTMLSpanElement>("span.word_inversion")
    ).forEach((span) => {
      Array.from(span.classList).forEach((class_name) => {
        if (class_name.indexOf("word_inversion") !== -1) {
          span.classList.remove(class_name);
        }
      });
      span.removeAttribute("data-markjs");
      if (span.classList.length === 0 && span.attributes.length === 1) {
        // spanを削除
        const parent = span.parentNode;
        while (span.firstChild) parent!.insertBefore(span.firstChild, span);
        parent!.removeChild(span);
        parent!.normalize(); // 反転されていたテキストノードを周囲のテキストノードと結合
      }
    });

    const preexisting_style = this.sat.content_window.document.head.querySelector(
      "style#SAT_word_inversion"
    );
    if (preexisting_style !== null) {
      preexisting_style.remove();
    }
  };
  getWordColors = (length: number): string[] => {
    // https://gist.github.com/ibrechin/2489005 から拝借して一部改変

    const colors: string[] = [];
    const l = this.sat.word.lightness;

    for (let i = 0; i < length; i++) {
      // 適当に設定
      colors.push(this.sat.hslToRgb(i / length, 1.0, l));
    }

    return colors;
  };
  calcWordColor = (bg_color: string): string => {
    const brightness =
      parseInt(bg_color.substr(1, 2), 16) * 0.299 + // Red
      parseInt(bg_color.substr(3, 2), 16) * 0.587 + // Green
      parseInt(bg_color.substr(5, 2), 16) * 0.114; // Blue

    return brightness >= 140 ? "#111" : "#eed";
  };
  // 条文番号検索用関数
  hasIntersection = (articleNum1: string, articleNum2: string): boolean => {
    const compareArticleNum = (
      inputNum1: string,
      inputNum2: string
    ): -1 | 0 | 1 => {
      const num1 = inputNum1.match(/^[0-9]+/)![0]!;
      const num2 = inputNum2.match(/^[0-9]+/)![0]!;
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

    const isIncluded = (range: string[], num: string): boolean => {
      const res1 = compareArticleNum(range[0]!, num);
      const res2 = compareArticleNum(range[1]!, num);
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
          isIncluded(articleNums1, articleNums2[0]!) ||
          isIncluded(articleNums1, articleNums2[1]!) ||
          isIncluded(articleNums2, articleNums1[0]!) ||
          isIncluded(articleNums2, articleNums1[1]!)
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
}

type Rect = [string, number, number, number, number, number];
class SatCanvas {
  sat: Sat;
  element: HTMLCanvasElement;
  word_rect: Rect[] = [];
  constructor(sat: Sat, element: HTMLCanvasElement) {
    this.sat = sat;
    this.element = element;
  }

  updateData = () => {
    // ワード反転のバーの色や位置を更新
    this.word_rect = [];
    const color_dic: { [key: string]: number } = {};
    Array.from(
      new Set(
        Object.keys(this.sat.word.option).map((color_id: string) => {
          return this.sat.word.option[color_id]!.color;
        })
      )
    )
      .filter((color: string) => {
        return color !== "";
      })
      .forEach((color: string, i: number) => {
        color_dic[color] = i;
      });
    const color_num = Object.keys(color_dic).length;

    const span_parent_height =
      this.sat.content_root.parentElement!.scrollHeight;

    Array.from(
      this.sat.content_root.querySelectorAll<HTMLSpanElement>(
        "span.word_inversion"
      )
    ).filter((span) => {
      return span.offsetParent !== null;
    }).forEach((span) => {
      const fill_color = this.sat.rgbTo16(
        window.getComputedStyle(span).backgroundColor
      );
      
      const rect_x =
        this.element.width *
        (color_dic[fill_color]! / color_num);

      const offset = this.sat.getOffset(
        span,
        this.sat.content_root
      );
      const rect_y =
        this.element.height * (offset.offset_top / span_parent_height);
      const rect_height =
        3 * Math.max(span.offsetHeight / this.element.height, 2);
      this.word_rect.push([
        fill_color,
        Math.round(rect_x) - 0.5,
        Math.round(rect_y - rect_height / 2.0) - 0.5,
        Math.round(this.element.width / color_num) + 0,
        5,
        Math.round(rect_height / 2.0),
      ]);
    });
  };

  draw = () => {
    const ctx = this.element.getContext("2d")!;
    ctx.clearRect(0, 0, this.element.width, this.element.height);

    this.word_rect.forEach((rect_arr): void => {
      ctx.fillStyle = rect_arr[0];
      ctx.fillRect(rect_arr[1], rect_arr[2], rect_arr[3], rect_arr[4]);
    });
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    const scroll_div = document.getElementById("main") as HTMLElement;
    const scrollTop = scroll_div.scrollTop;
    const span_parent_height = scroll_div.scrollHeight;

    const top_height = document.querySelector<HTMLDivElement>("div.top")
      ? document.querySelector<HTMLDivElement>("div.top")!.offsetHeight
      : 0;
    ctx.strokeRect(
      2.5,
      scrollTop * (this.element.height / span_parent_height),
      this.element.width - 2.5,
      (window.innerHeight - top_height) *
      (this.element.height / span_parent_height)
    );
  };
}