/**
 * ヘルパー関数のユニットテスト
 *
 * レンダリング漏れ検出機構のコア機能をテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// テスト対象の関数
import { consumeField, consumeFields, verifyAllFieldsConsumed } from '../typescript-renderer';

describe('consumeField', () => {

  it('指定されたキーの値を取得し、オブジェクトから削除する', () => {
    const obj = { foo: 'bar', baz: 123 };
    const value = consumeField(obj, 'foo');

    expect(value).toBe('bar');
    expect(obj).toEqual({ baz: 123 });
    expect('foo' in obj).toBe(false);
  });

  it('存在しないキーの場合はundefinedを返す', () => {
    const obj = { foo: 'bar' };
    const value = consumeField(obj, 'nonexistent');

    expect(value).toBeUndefined();
    expect(obj).toEqual({ foo: 'bar' });
  });

  it('オブジェクトがnullまたはundefinedの場合はundefinedを返す', () => {
    expect(consumeField(null, 'foo')).toBeUndefined();
    expect(consumeField(undefined, 'foo')).toBeUndefined();
  });

  it('ネストされたオブジェクトも正しく削除する', () => {
    const obj = { nested: { foo: 'bar' }, other: 'value' };
    const value = consumeField(obj, 'nested');

    expect(value).toEqual({ foo: 'bar' });
    expect(obj).toEqual({ other: 'value' });
  });

  it('値が0やfalseでも正しく取得する', () => {
    const obj = { zero: 0, falsy: false, empty: '' };

    expect(consumeField(obj, 'zero')).toBe(0);
    expect(consumeField(obj, 'falsy')).toBe(false);
    expect(consumeField(obj, 'empty')).toBe('');

    expect(obj).toEqual({});
  });
});

describe('consumeFields', () => {

  it('複数のキーを一括で削除する', () => {
    const obj = { foo: 'bar', baz: 123, qux: true };
    consumeFields(obj, ['foo', 'baz']);

    expect(obj).toEqual({ qux: true });
    expect('foo' in obj).toBe(false);
    expect('baz' in obj).toBe(false);
  });

  it('存在しないキーが含まれていてもエラーにならない', () => {
    const obj = { foo: 'bar' };

    expect(() => {
      consumeFields(obj, ['foo', 'nonexistent', 'another']);
    }).not.toThrow();

    expect(obj).toEqual({});
  });

  it('空の配列を渡しても何も削除しない', () => {
    const obj = { foo: 'bar' };
    consumeFields(obj, []);

    expect(obj).toEqual({ foo: 'bar' });
  });

  it('オブジェクトがnullまたはundefinedの場合は何もしない', () => {
    expect(() => {
      consumeFields(null, ['foo']);
      consumeFields(undefined, ['bar']);
    }).not.toThrow();
  });
});

describe('verifyAllFieldsConsumed', () => {
  beforeEach(() => {
    // console.errorをモック
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // グローバルフラグをリセット
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__renderingLeakAlertShown = false;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未処理フィールドがない場合は警告を出力しない', () => {
    const obj = { ':@': { some: 'attr' } };

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).not.toHaveBeenCalled();
  });

  it('未処理フィールドがある場合はconsole.errorを呼び出す', () => {
    const obj = { unprocessed: 'value', ':@': { some: 'attr' } };

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[レンダリング漏れ検出] TestContext: 未処理フィールド: unprocessed')
    );
    expect(console.error).toHaveBeenCalledWith('オブジェクト詳細:', obj);
  });

  it('属性フィールド（:@）はデフォルトで許可される', () => {
    const obj = { ':@': { some: 'attr' } };

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).not.toHaveBeenCalled();
  });

  it('カスタムの許可フィールドを指定できる', () => {
    const obj = { ':@': { some: 'attr' }, _custom: 'allowed' };

    verifyAllFieldsConsumed(obj, 'TestContext', [':@', '_custom']);

    expect(console.error).not.toHaveBeenCalled();
  });

  it('複数の未処理フィールドがある場合は全て報告する', () => {
    const obj = { field1: 'value1', field2: 'value2', ':@': { some: 'attr' } };

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('field1, field2')
    );
  });

  it('オブジェクトがnullまたはundefinedの場合は何もしない', () => {
    verifyAllFieldsConsumed(null, 'TestContext');
    verifyAllFieldsConsumed(undefined, 'TestContext');

    expect(console.error).not.toHaveBeenCalled();
  });

  it('エラーを投げず、処理を継続する', () => {
    const obj = { unprocessed: 'value' };

    expect(() => {
      verifyAllFieldsConsumed(obj, 'TestContext');
    }).not.toThrow();
  });
});

describe('統合テスト: consume + verify', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('全フィールドを消費した場合、検証でエラーが出ない', () => {
    const obj = { foo: 'bar', baz: 123, ':@': { attr: 'value' } };

    consumeField(obj, 'foo');
    consumeField(obj, 'baz');

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).not.toHaveBeenCalled();
  });

  it('一部のフィールドを消費し忘れた場合、検証でエラーが出る', () => {
    const obj = { foo: 'bar', baz: 123, forgotten: 'oops', ':@': { attr: 'value' } };

    consumeField(obj, 'foo');
    consumeField(obj, 'baz');

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('forgotten')
    );
  });

  it('consumeFieldsで複数削除してから検証', () => {
    const obj = {
      field1: 'value1',
      field2: 'value2',
      field3: 'value3',
      ':@': { attr: 'value' }
    };

    consumeFields(obj, ['field1', 'field2', 'field3']);

    verifyAllFieldsConsumed(obj, 'TestContext');

    expect(console.error).not.toHaveBeenCalled();
  });
});
