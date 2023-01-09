import clsx from "clsx";
import { Component, createEffect, createSignal, For, Index } from "solid-js";
import { Input } from "./components/Input";
import { InputBase } from "./components/InputBase";
import { createReducer } from "./hooks/createReducer";

const STATUSES = ["str", "dex", "int", "luk", "all", "wat", "mat"] as const;
type Status = (typeof STATUSES)[number];
const STATUS_LABELS: { [key in Status]: string } = {
  str: "STR",
  dex: "DEX",
  int: "INT",
  luk: "LUK",
  all: "All%",
  wat: "攻撃力",
  mat: "魔力",
};

const SLOTS = [
  "weapon",
  "pendant1",
  "pendant2",
  "earring",
  "hat",
  "face",
  "eye",
  "belt",
  "top",
  "bottom",
  "overalls",
  "shoes",
  "gloves",
  "cape",
] as const;
type Slot = (typeof SLOTS)[number];
const SLOT_LABELS: { [key in Slot]: string } = {
  weapon: "武器",
  pendant1: "ペンダント",
  pendant2: "ペンダント",
  earring: "イヤリング",
  hat: "帽子",
  face: "顔",
  eye: "目",
  belt: "ベルト",
  top: "服（上）",
  bottom: "服（下）",
  overalls: "全身服",
  shoes: "靴",
  gloves: "手袋",
  cape: "マント",
};

type Multipliers = { [key in Status]: number };
type Flames = { [key in Status]: number };
type Equipments = { [key in Slot]: Flames };

type Character = {
  name: string;
  equipments: Equipments;
  multipliers: Multipliers;
};

const EMPTY_MULTIPLIERS: Multipliers = {
  str: 0,
  dex: 0,
  int: 0,
  luk: 0,
  all: 0,
  wat: 0,
  mat: 0,
};

const EMPTY_FLAMES: Flames = {
  str: 0,
  dex: 0,
  int: 0,
  luk: 0,
  all: 0,
  wat: 0,
  mat: 0,
};

const EMPTY_EQUIPMENTS: Equipments = {
  weapon: EMPTY_FLAMES,
  pendant1: EMPTY_FLAMES,
  pendant2: EMPTY_FLAMES,
  earring: EMPTY_FLAMES,
  hat: EMPTY_FLAMES,
  face: EMPTY_FLAMES,
  eye: EMPTY_FLAMES,
  belt: EMPTY_FLAMES,
  top: EMPTY_FLAMES,
  bottom: EMPTY_FLAMES,
  overalls: EMPTY_FLAMES,
  shoes: EMPTY_FLAMES,
  gloves: EMPTY_FLAMES,
  cape: EMPTY_FLAMES,
};

const EMPTY_CHARACTER: Character = {
  name: "",
  multipliers: EMPTY_MULTIPLIERS,
  equipments: EMPTY_EQUIPMENTS,
};

type MultiplierInputValues = { [key in Status]: string };
type FlameInputValues = { [key in Status]: string };
type EquipmentInputValues = { [key in Slot]: FlameInputValues };

type InputValues = {
  multipliers: { [key in Status]: string };
  equipments: { [key in Slot]: { [key in Status]: string } };
};

class SkipUpdate extends Error {}

const asNumber = (s: string): number => {
  const n = Number(s);
  if (isNaN(n)) throw new SkipUpdate();
  return n;
};

const multipliersToStrings = (
  multipliers: Multipliers,
): MultiplierInputValues => ({
  str: `${multipliers.str}`,
  dex: `${multipliers.dex}`,
  int: `${multipliers.int}`,
  luk: `${multipliers.luk}`,
  all: `${multipliers.all}`,
  wat: `${multipliers.wat}`,
  mat: `${multipliers.mat}`,
});

const multipliersToNumber = (
  multipliers: MultiplierInputValues,
): Multipliers => ({
  str: asNumber(multipliers.str),
  dex: asNumber(multipliers.dex),
  int: asNumber(multipliers.int),
  luk: asNumber(multipliers.luk),
  all: asNumber(multipliers.all),
  wat: asNumber(multipliers.wat),
  mat: asNumber(multipliers.mat),
});

const flamesToStrings = (flames: Flames): FlameInputValues => ({
  str: `${flames.str}`,
  dex: `${flames.dex}`,
  int: `${flames.int}`,
  luk: `${flames.luk}`,
  all: `${flames.all}`,
  wat: `${flames.wat}`,
  mat: `${flames.mat}`,
});

const flamesToNumber = (flames: FlameInputValues): Flames => ({
  str: asNumber(flames.str),
  dex: asNumber(flames.dex),
  int: asNumber(flames.int),
  luk: asNumber(flames.luk),
  all: asNumber(flames.all),
  wat: asNumber(flames.wat),
  mat: asNumber(flames.mat),
});

const equipmentsToStrings = (equipments: Equipments): EquipmentInputValues => ({
  weapon: flamesToStrings(equipments.weapon),
  pendant1: flamesToStrings(equipments.pendant1),
  pendant2: flamesToStrings(equipments.pendant2),
  earring: flamesToStrings(equipments.earring),
  hat: flamesToStrings(equipments.hat),
  face: flamesToStrings(equipments.face),
  eye: flamesToStrings(equipments.eye),
  belt: flamesToStrings(equipments.belt),
  top: flamesToStrings(equipments.top),
  bottom: flamesToStrings(equipments.bottom),
  overalls: flamesToStrings(equipments.overalls),
  shoes: flamesToStrings(equipments.shoes),
  gloves: flamesToStrings(equipments.gloves),
  cape: flamesToStrings(equipments.cape),
});

const equipmentsToNumber = (equipments: EquipmentInputValues): Equipments => ({
  weapon: flamesToNumber(equipments.weapon),
  pendant1: flamesToNumber(equipments.pendant1),
  pendant2: flamesToNumber(equipments.pendant2),
  earring: flamesToNumber(equipments.earring),
  hat: flamesToNumber(equipments.hat),
  face: flamesToNumber(equipments.face),
  eye: flamesToNumber(equipments.eye),
  belt: flamesToNumber(equipments.belt),
  top: flamesToNumber(equipments.top),
  bottom: flamesToNumber(equipments.bottom),
  overalls: flamesToNumber(equipments.overalls),
  shoes: flamesToNumber(equipments.shoes),
  gloves: flamesToNumber(equipments.gloves),
  cape: flamesToNumber(equipments.cape),
});

const characterToStrings = (character: Character): InputValues => ({
  multipliers: multipliersToStrings(character.multipliers),
  equipments: equipmentsToStrings(character.equipments),
});

type State = {
  index: number;
  inputValues: InputValues;
  characters: Character[];
};

const EMPTY_STATE: State = {
  index: 0,
  inputValues: characterToStrings(EMPTY_CHARACTER),
  characters: [EMPTY_CHARACTER],
};

type Action =
  | { type: "addCharacter" }
  | { type: "deleteCharacter" }
  | { type: "switchCharacter"; index: number }
  | { type: "setName"; value: string }
  | { type: "setMultiplier"; status: Status; value: string }
  | { type: "setFlame"; slot: Slot; status: Status; value: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "addCharacter": {
      const index = state.characters.length;
      const characters = [...state.characters, EMPTY_CHARACTER];
      const inputValues = characterToStrings(EMPTY_CHARACTER);
      return { index, characters, inputValues };
    }

    case "deleteCharacter": {
      const characters = [
        ...state.characters.slice(0, state.index),
        ...state.characters.slice(state.index + 1),
      ];
      const index = Math.min(state.index, characters.length - 1);
      const inputValues = characterToStrings(characters[index]);
      return { index, characters, inputValues };
    }

    case "switchCharacter": {
      const { index } = action;
      const inputValues = characterToStrings(state.characters[index]);
      return { ...state, index, inputValues };
    }

    case "setName": {
      state.characters[state.index].name = action.value;
      return state;
    }

    case "setMultiplier": {
      state.inputValues.multipliers[action.status] = action.value;
      const n = Number(action.value);
      if (!Number.isNaN(n))
        state.characters[state.index].multipliers[action.status] = n;
      return state;
    }

    case "setFlame": {
      state.inputValues.equipments[action.slot][action.status] = action.value;
      const n = Number(action.value);
      if (!Number.isNaN(n))
        state.characters[state.index].equipments[action.slot][action.status] =
          n;
      return state;
    }
  }
};

const initialState = () => {
  const value = localStorage.getItem("state");
  return value === null ? EMPTY_STATE : (JSON.parse(value) as State);
};

const App: Component = () => {
  const [state, dispatchState] = createReducer(initialState(), reducer);

  createEffect(() => {
    localStorage.setItem("state", JSON.stringify(state()));
  });

  const currentCharacter = () => state().characters[state().index];
  const inputValues = () => state().inputValues;

  return (
    <div class="flex flex-col">
      <div class="flex flex-row gap-1">
        <select
          onChange={(event) => {
            const index = Number(event.currentTarget.value);
            if (0 <= index && index < state().characters.length)
              dispatchState({ type: "switchCharacter", index });
          }}
        >
          <Index each={state().characters}>
            {(character, index) => (
              <option value={index} selected={index === state().index}>
                {character().name || `キャラクター${index + 1}`}
              </option>
            )}
          </Index>
        </select>

        <button
          class="rounded px-2 py-1 bg-blue-500 text-nord-0"
          onClick={() => dispatchState({ type: "addCharacter" })}
        >
          追加
        </button>
        <button
          class="rounded px-2 py-1 bg-red-500 text-nord-0"
          onClick={() => dispatchState({ type: "deleteCharacter" })}
        >
          削除
        </button>
      </div>

      <div>
        {
          <Input
            placeholder="名前"
            value={currentCharacter().name}
            onInput={({ currentTarget: { value } }) =>
              dispatchState({ type: "setName", value })
            }
          />
        }
      </div>

      <div class="grid grid-cols-9">
        <For
          each={[
            "装備部位",
            ...STATUSES.map((status) => STATUS_LABELS[status]),
            "転生スコア",
          ]}
        >
          {(label) => <div class="px-2">{label}</div>}
        </For>

        <div class="px-2 bg-nord-50">係数</div>
        <For each={STATUSES}>
          {(status) => (
            <div class="bg-nord-50">
              <InputBase
                class="w-full px-2 bg-[transparent] text-base leading-4 select-none active:outline-none focus:outline-none"
                size={1}
                value={inputValues().multipliers[status]}
                onInput={({ currentTarget: { value } }) =>
                  dispatchState({ type: "setMultiplier", status, value })
                }
              />
            </div>
          )}
        </For>
        <div class="px-2 bg-nord-50"></div>

        <For each={SLOTS}>
          {(slot, index) => (
            <>
              <div class={clsx("px-2", index() % 2 === 1 && "bg-nord-50")}>
                {SLOT_LABELS[slot]}
              </div>
              <For each={STATUSES}>
                {(status) => (
                  <div class={clsx(index() % 2 === 1 && "bg-nord-50")}>
                    <InputBase
                      class="w-full px-2 bg-[transparent] text-base leading-4 select-none active:outline-none focus:outline-none"
                      size={1}
                      value={inputValues().equipments[slot][status]}
                      onInput={({ currentTarget: { value } }) =>
                        dispatchState({ type: "setFlame", slot, status, value })
                      }
                    />
                  </div>
                )}
              </For>
              <div class={clsx("px-2", index() % 2 === 1 && "bg-nord-50")}>
                {STATUSES.map(
                  (status) =>
                    currentCharacter().equipments[slot][status] *
                    currentCharacter().multipliers[status],
                ).reduce((acc, v) => acc + v)}
              </div>
            </>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
