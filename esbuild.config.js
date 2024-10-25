#!/usr/bin/env node
const esbuild = require('esbuild')
const path = require('path')
// Add more entrypoints, if needed
const entryPoints = [
  "application.js",
]
const watchDirectories = [
  "./app/javascript/**/*.js",
  "./app/views/**/*.html.erb",
  "./app/assets/stylesheets/*.css",
]
const config = {
  absWorkingDir: path.join(process.cwd(), "./app/javascript"),
  bundle: true,
  entryPoints: entryPoints,
  outdir: path.join(process.cwd(), "./app/assets/builds"),
  sourcemap: true
}
async function rebuild() {
  const chokidar = require('chokidar')
  const http = require('http')
  const clients = []
  http.createServer((req, res) => {
    return clients.push(
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        Connection: "keep-alive",
      }),
    );
  }).listen(8082);
  let ctx = await esbuild.context({
    ...config,
    //incremental: true,
    banner: {
      js: ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();',
    },
  })
  let result = await ctx.rebuild()
  chokidar.watch(watchDirectories).on('all', async (event, path) => {
    if (path.includes("javascript")) {
      result = await ctx.rebuild()
    }
    clients.forEach((res) => res.write('data: update\n\n'))
    clients.length = 0
  });
}
if (process.argv.includes("--rebuild")) {
  rebuild()
} else {
  esbuild.build({
    ...config,
    minify: process.env.RAILS_ENV == "production",
  }).catch(() => process.exit(1));
}

console.log("Live reload server running on http://127.0.0.1:8082")