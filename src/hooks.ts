import { useState, useEffect, useCallback, useRef, useMemo } from "react"

export type UseAsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

export let useAsync = <T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): UseAsyncState<T> => {
  let [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    setState((prev) => ({ ...prev, loading: true, error: null }))

    asyncFn()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return state
}

export let useDebounce = <T>(value: T, delay: number): T => {
  let [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    let timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export let useThrottle = <T>(value: T, limit: number): T => {
  let [throttledValue, setThrottledValue] = useState(value)
  let lastRan = useRef(Date.now())

  useEffect(() => {
    let handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

export let useToggle = (
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] => {
  let [value, setValue] = useState(initialValue)
  let toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}

export let usePrevious = <T>(value: T): T | undefined => {
  let ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export let useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  let [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      let item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  let setValue = (value: T | ((val: T) => T)) => {
    try {
      let valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export let useMediaQuery = (query: string): boolean => {
  let [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    let mediaQuery = window.matchMedia(query)
    let handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

export let useOnClickOutside = <T extends HTMLElement>(
  handler: () => void
): React.RefObject<T | null> => {
  let ref = useRef<T>(null)

  useEffect(() => {
    let listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [handler])

  return ref
}

export let useIsMounted = (): (() => boolean) => {
  let isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

export let useInterval = (callback: () => void, delay: number | null) => {
  let savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    let id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

export let useWindowSize = () => {
  let [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }))

  useEffect(() => {
    if (typeof window === "undefined") return

    let handler = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return size
}
