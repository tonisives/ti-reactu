import { ReactNode, Children, isValidElement } from "react"

export let cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(" ")

export let mergeRefs =
  <T>(...refs: (React.Ref<T> | undefined)[]) =>
  (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T>).current = node
      }
    })
  }

export let getValidChildren = (children: ReactNode): ReactNode[] =>
  Children.toArray(children).filter(isValidElement)

export let callAll =
  <T extends unknown[]>(...fns: (((...args: T) => void) | undefined)[]) =>
  (...args: T) => {
    fns.forEach((fn) => fn?.(...args))
  }

export let noop = () => {}

export let isSSR = typeof window === "undefined"

export let canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
)

export type PropsWithChildren<P = unknown> = P & { children?: ReactNode }

export type PropsWithClassName<P = unknown> = P & { className?: string }

export type PropsWithStyle<P = unknown> = P & { style?: React.CSSProperties }

export type CommonProps<P = unknown> = PropsWithChildren<
  PropsWithClassName<PropsWithStyle<P>>
>

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

export let match = <T, R>(
  state: AsyncState<T>,
  handlers: {
    idle: () => R
    loading: () => R
    success: (data: T) => R
    error: (error: Error) => R
  }
): R => {
  switch (state.status) {
    case "idle":
      return handlers.idle()
    case "loading":
      return handlers.loading()
    case "success":
      return handlers.success(state.data)
    case "error":
      return handlers.error(state.error)
  }
}
