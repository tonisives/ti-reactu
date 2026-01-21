# eslint-plugin-react-style

Custom ESLint plugin to enforce React coding standards based on your functional React style guide.

This plugin helps maintain consistent React code style, especially when working with AI code generation. It encodes React best practices into automated rules that catch common issues like class components, function declarations, and inconsistent patterns.

## Rules

### react-style/prefer-concise-arrow-function (error, fixable)

Enforces concise arrow function syntax for single-expression functions. Use expression body (no braces, implicit return) when a function only returns a single expression.

**Bad:**

```tsx
export let UserCard = ({ name }: { name: string }) => {
  return <div>{name}</div>
}

let double = (x: number) => {
  return x * 2
}
```

**Good:**

```tsx
export let UserCard = ({ name }: { name: string }) => (
  <div>{name}</div>
)

let double = (x: number) => x * 2
```

This rule is auto-fixable with `--fix`. JSX expressions are automatically wrapped in parentheses.

### react-style/no-const-variables (error, fixable)

Enforces using `let` instead of `const` for variable declarations, except for top-level UPPER_CASE constants.

**Bad:**

```tsx
const userId = getUserId()
const [count, setCount] = useState(0)
```

**Good:**

```tsx
let userId = getUserId()
let [count, setCount] = useState(0)

// Top-level constants are allowed
const API_TIMEOUT = 5000
const MAX_RETRIES = 3
```

This rule is auto-fixable with `--fix`.

### react-style/no-function-declaration (error, fixable)

Enforces arrow function syntax instead of function declarations.

**Bad:**

```tsx
function UserProfile({ userId }: Props) {
  return <div>{userId}</div>
}

export function fetchData() {
  return fetch('/api/data')
}
```

**Good:**

```tsx
let UserProfile = ({ userId }: Props) => (
  <div>{userId}</div>
)

export let fetchData = () => fetch('/api/data')
```

This rule is auto-fixable with `--fix`.

### react-style/no-default-export (error)

Disallows default exports. Use named exports for better refactoring support and explicit imports.

**Bad:**

```tsx
export default function UserCard() { ... }
export default UserCard
```

**Good:**

```tsx
export let UserCard = () => ...
```

### react-style/no-interface (error, fixable)

Enforces using `type` instead of `interface` for type definitions.

**Bad:**

```tsx
interface UserProps {
  name: string
  age: number
}

interface AdminProps extends UserProps {
  role: string
}
```

**Good:**

```tsx
type UserProps = {
  name: string
  age: number
}

type AdminProps = UserProps & {
  role: string
}
```

This rule is auto-fixable with `--fix`.

### react-style/no-class-component (error)

Disallows class components. Use functional components with hooks instead.

**Bad:**

```tsx
class UserCard extends React.Component<Props> {
  render() {
    return <div>{this.props.name}</div>
  }
}

class Counter extends Component {
  state = { count: 0 }
  render() { ... }
}
```

**Good:**

```tsx
let UserCard = ({ name }: Props) => (
  <div>{name}</div>
)

let Counter = () => {
  let [count, setCount] = useState(0)
  return ...
}
```

### react-style/enforce-file-layout (error)

Enforces a consistent file layout where all exported items (types, functions, components) come first, followed by private helper functions.

**Bad:**

```tsx
let privateHelper = (x: number) => x * 2

export type UserProps = { name: string }

let formatName = (name: string) => name.toUpperCase()

export let UserCard = ({ name }: UserProps) => ...
```

**Good:**

```tsx
// Exports first
export type UserProps = { name: string }

export let UserCard = ({ name }: UserProps) => (
  <div>{formatName(name)}</div>
)

// Private functions after
let privateHelper = (x: number) => x * 2
let formatName = (name: string) => name.toUpperCase()
```

### react-style/no-inline-handler (error)

Disallows long inline event handlers in JSX. Extract complex handlers to named functions for better readability and testability.

**Default:** Maximum 30 characters allowed for inline handlers.

**Configuration:**

```js
"react-style/no-inline-handler": ["error", { maxBodyLength: 30 }]
```

**Bad:**

```tsx
<button onClick={() => {
  setLoading(true)
  fetchData().then(data => {
    setData(data)
    setLoading(false)
  })
}}>
  Submit
</button>
```

**Good:**

```tsx
let handleClick = () => {
  setLoading(true)
  fetchData().then(data => {
    setData(data)
    setLoading(false)
  })
}

<button onClick={handleClick}>Submit</button>

// Short handlers are allowed
<button onClick={() => setCount(c => c + 1)}>+</button>
```

### react-style/prefer-early-return (warn)

Suggests using early returns instead of wrapping entire component body in conditionals.

**Bad:**

```tsx
let UserProfile = ({ user }: Props) => {
  return user ? (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  ) : null
}
```

**Good:**

```tsx
let UserProfile = ({ user }: Props) => {
  if (!user) return null

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

## Component Style Examples

### Simple Component (expression body)

```tsx
type StatusBadgeProps = {
  status: 'active' | 'inactive'
  label: string
}

export let StatusBadge = ({ status, label }: StatusBadgeProps) => (
  <span className={`badge badge-${status}`}>{label}</span>
)
```

### Component with State (block body)

```tsx
type CounterProps = {
  initialValue?: number
}

export let Counter = ({ initialValue = 0 }: CounterProps) => {
  let [count, setCount] = useState(initialValue)

  let increment = () => setCount(c => c + 1)
  let decrement = () => setCount(c => c - 1)

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

### Component with Early Returns

```tsx
type UserCardProps = {
  userId: string
}

export let UserCard = ({ userId }: UserCardProps) => {
  let { data: user, loading, error } = useUser(userId)

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!user) return null

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### Custom Hook

```tsx
type UseToggleReturn = [boolean, () => void, (value: boolean) => void]

export let useToggle = (initialValue = false): UseToggleReturn => {
  let [value, setValue] = useState(initialValue)
  let toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle, setValue]
}
```

## Installation

This plugin is located in the ti-reactu repository. To use it in your project:

1. Add to your `package.json`:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "ti-reactu": "file:/path/to/ti-reactu"
  }
}
```

2. Create `eslint.config.cjs` in your project root:

```js
const tsParser = require("@typescript-eslint/parser")
const reactStyle = require("ti-reactu/eslint-plugin-react-style")

module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-style": reactStyle,
    },
    rules: {
      ...reactStyle.configs.recommended.rules,
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
]
```

3. Add scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
  }
}
```

## Key Principles

The rules encode these principles:

- **Arrow functions everywhere**: Consistent syntax for components, hooks, and handlers
- **Expression bodies when possible**: Concise components without unnecessary braces
- **`let` over `const`**: Except for true constants (UPPER_CASE)
- **Types over interfaces**: Better composition with `&` intersection types
- **Named exports only**: Explicit imports, better refactoring
- **Functional components only**: Hooks provide all the functionality you need
- **Exports first**: Public API at the top of each file
- **Extract handlers**: Named functions for complex event handlers
- **Early returns**: Reduce nesting in conditional rendering
