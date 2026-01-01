import { NoteStructTitleType, NoteStructType } from "@api/types/law";
import { LawAny } from "./any";
import { LawRemarks } from "./remarks";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 記項目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {NoteStructType} props.noteStruct - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 記項目のコンポーネント
 */
export const LawNoteStruct: React.FC<{
  noteStruct: NoteStructType;
  treeElement: string[];
}> = (props) => {
  const { noteStruct, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `NoteStruct${index ? `_${index}` : ""}`,
  ];
  const NoteStructTitle = getType<NoteStructTitleType>(
    noteStruct.NoteStruct,
    "NoteStructTitle"
  );
  return (
    <>
      {NoteStructTitle.length > 0 && (
        <div>
          {getTextNode(NoteStructTitle[0].NoteStructTitle, addTreeElement())}
        </div>
      )}
      {noteStruct.NoteStruct.map((dt, index) => {
        if ("Remarks" in dt) {
          return (
            <LawRemarks
              key={`${addTreeElement(index).join("_")}`}
              remarksList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Note" in dt) {
          return (
            <LawAny
              key={`${addTreeElement(index).join("_")}`}
              lawTypeList={[dt]}
              parentElement="Note"
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </>
  );
};
