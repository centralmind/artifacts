# CentralMind Artifacts

[![NPM version][npm-image]][npm-url]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Artifact viewer for Generative AI. The library provides a React component to compile and run any React or Vue.js code in a secure browser environment. [Tailwind CSS](https://tailwindcss.com/) styling and [shadcn/ui](https://ui.shadcn.com/) components are both supported.

## Table of contents

* [Installation](#Installation)
* [Usage](#Usage)
* [License](#license)

## Installation

```console
$ npm install @centralmind/artifacts
```

## Usage

### React Artifacts

```tsx
import { ArtifactViewer } from '@centralmind/artifacts';

const files = {
  '/app.tsx': `import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1 class="text-3xl font-bold">{count}</h1>
      <br/>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
}`};

export default function App() {
  return <ArtifactViewer files={files} />;
}
```

### Vue.js Artifacts

```tsx
import { ArtifactViewer } from '@centralmind/artifacts';

const files = {
  '/app.vue': `
<template>
  <div id="app">
    <h1>Hello World!</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
#app {
  text-align: center;
  margin-top: 60px;
}

h1 {
  color: #42b983;
}
</style>
`,
};

export default function App() {
  return <ArtifactViewer files={files} />;
}
```

#### HTML Artifacts
```tsx
import { ArtifactViewer } from '@centralmind/artifacts';

const files = {
  '/index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a simple HTML page that displays "Hello, World!"</p>
</body>
</html>
  `,
};

export default function App() {
  return <ArtifactViewer files={files} />;
}
```



## License

[MIT](LICENSE)

[npm-url]: https://www.npmjs.com/package/@centralmind/artifacts
[npm-image]: https://img.shields.io/npm/v/@centralmind/artifacts