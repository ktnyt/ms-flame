import { Accessor, createEffect, createSignal } from "solid-js";

export type Reducer<State, Action> = (state: State, action: Action) => State;

export type Dispatcher<Action> = (action: Action) => void;

export const createReducer = <State extends object, Action>(
  init: State,
  reducer: Reducer<State, Action>,
): [Accessor<State>, Dispatcher<Action>] => {
  const [state, setState] = createSignal(init, { equals: false });
  const dispatch = (action: Action) => {
    setState((prev) => reducer(prev, action));
  };
  return [state, dispatch];
};
