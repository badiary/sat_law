import { MainProvisionType } from "@api/types/law";
import { LawChapter } from "./chapter";
import { LawParagraph } from "./paragraph";
import { LawArticle } from "./article";
import { LawPart } from "./part";
import { LawSection } from "./section";

/**
 * 法令本文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {MainProvisionType} props.mainProvision - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 法令本文のコンポーネント
 */
export const LawMainProvision: React.FC<{
  mainProvision: MainProvisionType;
  treeElement: string[];
}> = (props) => {
  const { mainProvision, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `MainProvision_${index}`,
  ];
  let paragraphIndex = 0;
  return (
    <div>
      {mainProvision.MainProvision.map((dt, index) => {
        if ("Chapter" in dt) {
          return (
            <LawChapter
              key={`${addTreeElement(index).join("_")}`}
              chapterList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Paragraph" in dt) {
          paragraphIndex++;
          return (
            <LawParagraph
              key={`${addTreeElement(index).join("_")}`}
              paragraphList={[dt]}
              treeElement={addTreeElement(index)}
              parentParagraphIndex={paragraphIndex - 1}
            />
          );
        } else if ("Article" in dt) {
          return (
            <LawArticle
              key={`${addTreeElement(index).join("_")}`}
              articleList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Part" in dt) {
          return (
            <LawPart
              key={`${addTreeElement(index).join("_")}`}
              partList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else {
          return (
            <LawSection
              key={`${addTreeElement(index).join("_")}`}
              sectionList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </div>
  );
};
