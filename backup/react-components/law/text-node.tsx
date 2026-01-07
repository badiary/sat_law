/* eslint-disable @typescript-eslint/no-explicit-any */
import { LawAny } from "@api/components/law/any";
import { getType } from "@api/lib/law/law";
import { RtType, TextNodeType, TextType } from "@api/types/law";

export const getTextNode = (
  val: Array<TextNodeType>,
  treeElement: string[]
) => {
  const getLineStyle = (
    Style?: "dotted" | "double" | "none" | "solid"
  ): React.CSSProperties => {
    switch (Style) {
      case undefined:
        return {
          textDecorationLine: "underline",
          textDecorationStyle: "solid",
        };
      case "none":
        return {
          textDecorationLine: "none",
        };
      default:
        return {
          textDecorationLine: Style,
          textDecorationStyle: "solid",
        };
    }
  };

  return (
    <>
      {val.map((dt, index) => {
        if ("Line" in dt) {
          return (
            <span key={`Line_${index}`} style={getLineStyle(dt.Style)}>
              {getTextNode(dt.Line, treeElement)}
            </span>
          );
        } else if ("Ruby" in dt) {
          return (
            <ruby key={`Ruby_${index}`}>
              {getType<TextType>(dt.Ruby, "_")[0]._}
              <rt>{getType<RtType>(dt.Ruby, "Rt")[0].Rt[0]._}</rt>
            </ruby>
          );
        } else if ("Sup" in dt) {
          return (
            <sup key={`Sup_${index}`} className="Sup">
              {getType<TextType>(dt.Sup, "_")[0]._}
            </sup>
          );
        } else if ("Sub" in dt) {
          return (
            <sub key={`Sub_${index}`} className="Sub">
              {getType<TextType>(dt.Sub, "_")[0]._}
            </sub>
          );
        } else if ("QuoteStruct" in dt) {
          return (
            <LawAny
              key={`QuoteStruct_${index}`}
              lawTypeList={dt.QuoteStruct}
              treeElement={treeElement}
              parentElement="QuoteStruct"
            />
          );
        } else if ("ArithFormula" in dt) {
          return (
            <div key={`ArithFormula_${index}`} className="pl-4">
              <LawAny
                lawTypeList={dt.ArithFormula}
                treeElement={treeElement}
                parentElement="ArithFormula"
              />
            </div>
          );
        } else {
          return dt._;
        }
      })}
    </>
  );
};

export const TextNode = ({
  val,
  treeElement = [],
}: {
  val: Array<TextNodeType>;
  treeElement?: string[];
}) => {
  const getLineStyle = (
    Style?: "dotted" | "double" | "none" | "solid"
  ): React.CSSProperties => {
    switch (Style) {
      case undefined:
        return {
          textDecorationLine: "underline",
          textDecorationStyle: "solid",
        };
      case "none":
        return {
          textDecorationLine: "none",
        };
      default:
        return {
          textDecorationLine: Style,
          textDecorationStyle: "solid",
        };
    }
  };

  return (
    <>
      {val.map((dt, index) => {
        if ("Line" in dt) {
          return (
            <span key={`Line_${index}`} style={getLineStyle(dt.Style)}>
              {getTextNode(dt.Line, treeElement)}
            </span>
          );
        } else if ("Ruby" in dt) {
          return (
            <ruby key={`Ruby_${index}`}>
              {getType<TextType>(dt.Ruby, "_")[0]._}
              <rt>{getType<RtType>(dt.Ruby, "Rt")[0].Rt[0]._}</rt>
            </ruby>
          );
        } else if ("Sup" in dt) {
          return (
            <sup key={`Sup_${index}`} className="Sup">
              {getType<TextType>(dt.Sup, "_")[0]._}
            </sup>
          );
        } else if ("Sub" in dt) {
          return (
            <sub key={`Sub_${index}`} className="Sub">
              {getType<TextType>(dt.Sub, "_")[0]._}
            </sub>
          );
        } else if ("QuoteStruct" in dt) {
          return (
            <LawAny
              key={`QuoteStruct_${index}`}
              lawTypeList={dt.QuoteStruct}
              treeElement={treeElement}
              parentElement="QuoteStruct"
            />
          );
        } else if ("ArithFormula" in dt) {
          return (
            <div key={`ArithFormula_${index}`} className="pl-4">
              <LawAny
                lawTypeList={dt.ArithFormula}
                treeElement={treeElement}
                parentElement="ArithFormula"
              />
            </div>
          );
        } else {
          return dt._;
        }
      })}
    </>
  );
};
