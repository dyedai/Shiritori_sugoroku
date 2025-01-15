"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "./input";

export type WordInputProps = {
  maxLength: number;
  lastCharacter: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  onSubmit?: () => void;
  disabled?: boolean;
};

type CharacterProps = {
  character: string;
  locked?: boolean;
  current?: boolean;
  onClick?: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: KeyboardEventHandler;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
};

const fullJapanesePattern =
  /^[\uFF21-\uFF3A\uFF41-\uFF5A\u3041-\u3096\u30fc]+$/;
const hiraganaPattern = /^[\u3041-\u3096\u30fc]+$/;

const WordInput = (props: WordInputProps) => {
  const { maxLength, lastCharacter, value, onChange, onSubmit, disabled } =
    props;
  const [pos, setPos] = useState<number | undefined>(undefined);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const chars: string[] = useMemo(
    () =>
      [
        ...value,
        ...new Array(Math.max(maxLength - value.length - 1, 0)).fill(""),
      ].slice(0, maxLength - 1),
    [value, maxLength]
  );

  const changePos = useCallback(
    (offset: number | false) => {
      if (offset === false) {
        inputRefs.current[pos].blur();
        return;
      }

      const newPos = Math.max(0, Math.min(pos + offset, maxLength - 2));
      inputRefs.current[newPos]?.focus();
    },
    [pos, maxLength, inputRefs]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // 文字が消去されたらカーソルを1つ前に戻す
      if (e.target.value === "") {
        chars[pos] = "";
        onChange(chars);
        changePos(-1);
      }

      // 平仮名か全角アルファベット以外が入力されたら無視
      if (!fullJapanesePattern.test(e.target.value)) return;

      const newChar = e.target.value;

      if (hiraganaPattern.test(newChar)) {
        // 変換された平仮名が2文字以上のとき隣の入力欄にも伝搬
        for (let i = 0; i < newChar.length; i++) {
          if (chars.length <= pos + i) break;
          chars[pos + i] = newChar[i];
        }
        changePos(newChar.length);
      } else {
        // 入力途中の場合は保持
        chars[pos] = newChar;
      }

      onChange(chars);
    },
    [chars, onChange, pos, changePos]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && e.currentTarget.value === "") {
        changePos(-1);
      } else if (e.key === "Enter") {
        changePos(false);
        onSubmit();
        e.preventDefault();
      }
    },
    [changePos, onSubmit]
  );

  return (
    <>
      <div
        className="flex items-center justify-center gap-2 mb-6"
        onBlur={() => setPos(undefined)}
      >
        <Character character={lastCharacter} locked />
        {chars.map((char, index) => {
          return (
            <Character
              character={char}
              key={index}
              current={index === pos}
              onClick={() => setPos(index)}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
              disabled={disabled}
            />
          );
        })}
      </div>
    </>
  );
};

const Character = (props: CharacterProps) => {
  const {
    character,
    locked,
    current,
    onClick,
    onChange,
    onKeyDown,
    inputRef,
    disabled,
  } = props;

  return (
    <div className="w-12 h-12 relative rounded-lg">
      <div
        className={`w-12 h-12 absolute z-0 inset-0 rounded-lg border-collapse duration-700 transition-opacity ${
          locked ? "border-purple-500 bg-purple-100" : "bg-transparent"
        } ${
          current
            ? "border-purple-500 border-4 animate-pulse"
            : "border-purple-300 border-2 animate-none"
        }`}
      ></div>
      {locked ? (
        <div className="w-12 h-12 absolute z-10 inset-0 flex justify-center items-center font-bold text-xl text-purple-800">
          {character}
        </div>
      ) : (
        <Input
          className={`w-12 h-12 absolute z-10 inset-0 text-center`}
          tabIndex={locked ? -1 : 0}
          type="text"
          value={character}
          onFocus={onClick}
          onClick={onClick}
          onChange={onChange}
          onKeyDown={onKeyDown}
          ref={inputRef}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default WordInput;
