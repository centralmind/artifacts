# CentralMind Artifacts

[![NPM version][npm-image]][npm-url]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Artifact viewer for Generative AI. The library provides a React component to compile and run any React or Vue.js code in a secure browser environment.


## Table of contents

* [Installation](#Installation)
* [License](#license)

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

## Installation

```console
$ npm install @centralmind/artifacts
```

## License

[MIT](LICENSE)

[npm-url]: https://www.npmjs.com/package/@centralmind/artifacts
[npm-image]: https://img.shields.io/npm/v/@centralmind/artifacts