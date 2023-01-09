import clsx from "clsx";
import { Component } from "solid-js";
import { InputBase, InputBaseProps } from "./InputBase";

export type InputProps = InputBaseProps;

export const Input: Component<InputProps> = (props) => (
  <InputBase
    {...props}
    class={clsx(
      props.class,
      "inline-flex rounded px-2 text-base leading-4",
      "bg-nord-500 bg-opacity-0 hover:bg-opacity-10",
      "text-nord-1000 caret-nord-1000",
      "placeholder:text-nord-500 cursor-text",
      "select-none active:outline-none focus:outline-none transition"
    )}
  />
);
