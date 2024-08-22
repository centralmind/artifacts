import { ArtifactViewer } from "@centralmind/artifacts";

const files = {
  "/index.html": `
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

export default function HtmlPage() {
  return <ArtifactViewer files={files} />;
}
