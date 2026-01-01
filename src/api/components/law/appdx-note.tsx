import {
  AppdxNoteTitleType,
  AppdxNoteType,
  RelatedArticleNumType,
  RemarksType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawRelatedArticleNum } from "./related-article-num";
import { LawNoteStruct } from "./note-struct";
import { LawFigStruct } from "./fig-struct";
import { LawTableStruct } from "./table-struct";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 別記のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxNoteType[]} props.appdxNoteList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 別記のコンポーネント
 */
export const LawAppdxNote: React.FC<{
  appdxNoteList: AppdxNoteType[];
  treeElement: string[];
}> = (props) => {
  const { appdxNoteList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `AppdxNote_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];
  return (
    <>
      {appdxNoteList.map((dt, index) => {
        const AppdxNoteTitle = getType<AppdxNoteTitleType>(
          dt.AppdxNote,
          "AppdxNoteTitle"
        );
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.AppdxNote,
          "RelatedArticleNum"
        );
        const Remarks = getType<RemarksType>(dt.AppdxNote, "Remarks");

        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active AppdxNote"
          >
            {(AppdxNoteTitle.length > 0 || RelatedArticleNum.length > 0) && (
              <div className="_div_AppdxNoteTitle">
                {AppdxNoteTitle.length > 0 &&
                  getTextNode(
                    AppdxNoteTitle[0].AppdxNoteTitle,
                    addTreeElement(index)
                  )}
                <LawRelatedArticleNum
                  relatedArticleNumList={RelatedArticleNum}
                  treeElement={addTreeElement(index)}
                />
              </div>
            )}
            {dt.AppdxNote.map((dt2, index2) => {
              if ("NoteStruct" in dt2) {
                return (
                  <LawNoteStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    noteStruct={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("FigStruct" in dt2) {
                return (
                  <LawFigStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    figStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TableStruct" in dt2) {
                return (
                  <LawTableStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              }
            })}
            <LawRemarks
              remarksList={Remarks}
              treeElement={addTreeElement(index)}
            />
          </section>
        );
      })}
    </>
  );
};
