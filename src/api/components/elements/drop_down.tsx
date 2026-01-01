// "use client";
// import { DropdownMenuType } from "@api/types/common";
// import Icon from "./icons";
// import useDropdownHooks from "@api/hooks/dropdown-hooks";

// /**
//  * キーワード検索、文書一覧取得のドロップダウンの項目
//  */
// export const DROPDOWN_ITEMS: DropdownMenuType[] = [
//   {
//     label: "種別・法令番号(降順)",
//     value: 1,
//   },
//   {
//     label: "種別・法令番号(昇順)",
//     value: 2,
//   },
//   {
//     label: "公布日(降順)",
//     value: 3,
//   },
//   {
//     label: "公布日(昇順)",
//     value: 4,
//   },
//   {
//     label: "五十音順",
//     value: 5,
//   },
// ];
// export type SortValueType = (typeof DROPDOWN_ITEMS)[number]["value"];

// /**
//  * ドロップダウンコンポーネント
//  * @param param0
//  * @returns {React.ReactNode} ドロップダウンコンポーネント
//  */
// const DropDownMenuButton = ({
//   items = DROPDOWN_ITEMS,
// }: {
//   items?: DropdownMenuType[];
// }) => {
//   const { selectedSort, isShowDropDown, toggleDropdown, onChangeResultSort } =
//     useDropdownHooks(items);

//   return (
//     <div role="button" className="relative">
//       <button
//         className={`dropdown ${isShowDropDown ? "active" : ""}`}
//         onClick={toggleDropdown}
//       >
//         <div className="w-full md:w-44 flex justify-between">
//           <span>{selectedSort.label}</span>
//           <Icon name="expandMore" />
//         </div>
//       </button>
//       {isShowDropDown && (
//         <div
//           className={isShowDropDown ? "dropdown-item" : "dropdown-item active"}
//         >
//           {items.map((item) => {
//             return (
//               <button
//                 key={item.value}
//                 className="w-full text-left"
//                 onClick={onChangeResultSort}
//                 aria-label={item.label}
//                 tabIndex={0}
//                 value={item.value}
//               >
//                 {item.label}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DropDownMenuButton;

// export const DropdownSkelton = () => {
//   return (
//     <div>
//       <div className="h-[60px] w-full md:w-44 flex items-center md:col-span-3 border border-Sumi-200 px-4 rounded text-left">
//         <div className="rounded-6xl h-3.5 bg-Sumi-200 w-full md:w-36" />
//       </div>
//     </div>
//   );
// };
