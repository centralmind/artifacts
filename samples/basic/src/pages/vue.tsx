import { ArtifactViewer } from "@centralmind/artifacts";

const files = {
  "/app.vue": `
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

export default function VuePage() {
  return <ArtifactViewer files={files} />;
}
