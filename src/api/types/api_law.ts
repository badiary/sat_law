import {
  Era,
  LawType,
  Mission,
  RepealStatus,
  Status,
} from "@api/lib/typescript-fetch";
import { LawType as LawData } from "@api/types/law";

/**
 * XMLのテキストノードの型
 */
export type XmlProperty<T> = {
  _: T;
};

/**
 * 法令本文取得APIレスポンスの型
 * @param lawdata_response 法令本文取得APIレスポンス
 */
export type LawDataResponseType = {
  lawdata_response: Array<
    | ParsedLawFullText
    | ParsedAttachedFilesInfo
    | ParsedLawInfo
    | ParsedRevisionInfo
  >;
};

/**
 * 法令本文の型
 * @param law_full_text 法令本文
 */
export type ParsedLawFullText = {
  law_full_text: LawData[];
};

/**
 * XML添付ファイル情報の型
 * @param law_revision_id 法令ID
 * @param src 法令本文中の添付ファイルのsrc属性
 * @param updated 正誤などによる更新日時
 */
export type XMLParsedAttachedFile = {
  law_revision_id?: XmlProperty<string>[];
  src?: XmlProperty<string>[];
  updated?: XmlProperty<Date>[];
};

/**
 * 添付ファイル情報の型
 * @param attached_file 添付ファイル情報（単数形）
 */
export type ParsedAttachedFile = {
  attached_file: XMLParsedAttachedFile[];
};

/**
 * XML添付ファイル情報の型
 * @param image_data 添付ファイルデータ（添付ファイルをフォルダ名pictに収集し、フォルダ全体をZIP形式で圧縮したファイルをBase64でエンコードした文字列）
 * @param attached_files 添付ファイル一覧
 */
export type XMLParsedAttachedFilesInfo = {
  image_data?: XmlProperty<string>[];
  attached_files?: ParsedAttachedFile[];
};

/**
 * 添付ファイル情報の型
 * @param attached_files_info 添付ファイル情報
 */
export type ParsedAttachedFilesInfo = {
  attached_files_info: XMLParsedAttachedFilesInfo[];
};

/**
 * XML履歴に依存しない法令（法令IDで特定される法令）のメタ情報の型
 * @param law_type 法令種別
 * @param law_id 法令ID
 * @param law_num 法令番号
 * @param law_num_era 元号
 * @param law_num_year 法令番号の年
 * @param law_num_type 法令番号の種別
 * @param law_num_num 法令番号の号数
 * @param promulgation_date 公布日
 */
export type XMLParsedLawInfo = {
  law_type?: XmlProperty<LawType>[];
  law_id?: XmlProperty<string>[];
  law_num?: XmlProperty<string>[];
  law_num_era?: XmlProperty<Era>[];
  law_num_year?: XmlProperty<number>[];
  law_num_type?: XmlProperty<LawType>[];
  law_num_num?: XmlProperty<string>[];
  promulgation_date?: XmlProperty<Date>[];
};

/**
 * 履歴に依存しない法令（法令IDで特定される法令）のメタ情報の型
 * @param law_info 履歴に依存しない法令（法令IDで特定される法令）のメタ情報
 */
export type ParsedLawInfo = {
  law_info: XMLParsedLawInfo[];
};

/**
 * XML法令の履歴に関する情報の型
 * @param law_revision_id 法令履歴ID
 * @param law_type 法令種別
 * @param law_title 法令名
 * @param law_title_kana 法令名読み
 * @param law_title_kanaseion 法令名読み清音
 * @param abbrev 法令略称
 * @param abbrev_kana 法令略称読み
 * @param category 法令分野分類
 * @param revision_index 法令履歴の順序を表す数値
 * @param subrevision_index 法令履歴の修正版を表す数値
 * @param updated 正誤などによる更新日時
 * @param previus_revision_id 改正前の法令履歴ID（新規制定のため改正前がない場合はnull）
 * @param amendment_promulgate_date 改正法令公布日
 * @param amendment_enforcement_date 改正法令施行期日（この履歴に対応する改正の施行期日）
 * @param amendment_enforcement_end_date 改正法令施行終了日（この履歴に対応する改正の施行期日）
 * @param amendment_enforcement_comment 施行期日規定などの参考情報（この履歴に対応する改正の施行期日）
 * @param amendment_scheduled_enforcement_date 擬似的な施行期日（実際の施行期日とは限らない）（この履歴に対応する改正の施行期日）
 * @param amendment_law_id 改正法令の法令ID（この履歴に対応する改正法令）
 * @param amendment_law_title 改正法令名
 * @param amendment_law_title_kana 改正法令名読み
 * @param amendment_law_title_kanaseion 改正法令名読み清音
 * @param amendment_law_num 改正法令番号
 * @param repeal_status 廃止等の状態
 * @param repeal_date 廃止日
 * @param remain_in_force 廃止後の効力
 * @param mission 新規制定
 * @param status 履歴の状態
 * @param is_last 当該リビジョンが最も未来のものである場合はtrue
 */
export type XMLParsedRevisionInfo = {
  law_revision_id?: XmlProperty<string>[];
  law_type?: XmlProperty<LawType>[];
  law_title?: XmlProperty<string>[];
  law_title_kana?: XmlProperty<string>[];
  law_title_kanaseion?: XmlProperty<string>[];
  abbrev?: XmlProperty<string>[];
  abbrev_kana?: XmlProperty<string>[];
  category?: XmlProperty<string>[];
  revision_index?: XmlProperty<number>[];
  subrevision_index?: XmlProperty<number>[];
  updated?: XmlProperty<Date>[];
  previus_revision_id?: XmlProperty<string | null>[];
  amendment_promulgate_date?: XmlProperty<Date>[];
  amendment_enforcement_date?: XmlProperty<Date>[];
  amendment_enforcement_end_date?: XmlProperty<Date>[];
  amendment_enforcement_comment?: XmlProperty<string>[];
  amendment_scheduled_enforcement_date?: XmlProperty<Date>[];
  amendment_law_id?: XmlProperty<string>[];
  amendment_law_title?: XmlProperty<string>[];
  amendment_law_title_kana?: XmlProperty<string>[];
  amendment_law_title_kanaseion?: XmlProperty<string>[];
  amendment_law_num?: XmlProperty<string>[];
  repeal_status?: XmlProperty<RepealStatus>[];
  repeal_date?: XmlProperty<Date | null>[];
  remain_in_force?: XmlProperty<boolean | null>[];
  mission?: XmlProperty<Mission>[];
  status?: XmlProperty<Status>[];
  is_last?: XmlProperty<boolean>[];
};

/**
 * 法令の履歴に関する情報の型
 * @param revision_info 法令の履歴に関する情報
 */
export type ParsedRevisionInfo = {
  revision_info: XMLParsedRevisionInfo[];
};
