import { ArtifactViewer } from "@centralmind/artifacts";

const files = {
  "/app.tsx": `import { useState } from 'react';
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
}`,
};

export function ReactPage() {
  return <ArtifactViewer files={files} />;
}
