# README
## Requirements
- Ruby 3.1.2
- Rails ~= 7.2.1
- Nodejs (Current LTS version)
- Yarn
- Dotenv (latest version from your OS package manager)
- [RVM](https://rvm.io/rvm/install)
## Setup
A lot of this initial setup is referenced in this [Medium](https://medium.com/@ahmednadar/setup-tailwindcss-postcss-and-esbuild-on-rails-7-d01cebaa493e) article.
1. **Generate a new Rails 7 application** with the Propshaft asset pipeline. This uses the `jsbundling-rails` and `cssbundling-rails` gems along with Nodejs and yarn to install CSS and JavaScript asset bundling/minifying.

    ```rb
    rails new etracker-eu -a propshaft --css=tailwind --javascript=esbuild
    ```
2. **Use the latest version of Yarn** package manager

    Nodejs >=18 includes `corepack`. Corepack manages the binaries for your package manager.

    Activate Corepack
    ```sh
    corepack enable
    ```
    `cd` into your project directory and set the version of yarn to current stable version
    ```sh
    yarn set version stable
    ```
    Delete any existing `.npmrc` and `.yarnc` files and create a new `.yarnrc.yml` file
    ```sh
    touch .yarnrc.yml
    ```
    add this to your new file
    ```yml
    nodeLinker: pnp
    ```
    This tells Yarn to use `plug-n-play` mode to reference packages, instead of directly using node_modules
    Delete any old `node_modules` folder and run
    ```sh
    yarn install
    ```

3. **Configure Tailwind** so we can use `@apply` and `@import` wich cssbundling-rails doesn't allow. First we install `postcss` and some other Tailwind plugins.

    ```sh
    yarn add postcss postcss-flexbugs-fixes postcss-import postcss-nested @tailwindcss/forms @tailwindcss/typography
    ```

    **Create the postcss config file** in the project root

    ```sh
    touch postcss.config.js
    ```
    Add this to the new config file
    ```js
    module.exports = {
      plugins: [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer'),
        require("postcss-nested"),
        require("postcss-flexbugs-fixes"),
      ]
    }
    ```
    **Update the Tailwind stylesheet** `app/assets/stylesheets/application.tailwind.css` to use `@import` directives

    ```css
    @import "tailwindcss/base";
    @import "tailwindcss/components";
    @import "tailwindcss/utilities";
    ```
    ___
    **Update the Tailwind config file** `/tailwind.config.js` to use the new plugins we installed above
    ```js
    module.exports = {
      content: [
        "./app/**/*.html.erb",
        "./app/helpers/**/*.rb",
        "./app/javascript/**/*.js",
      ],
      plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
      ],
    }
    ```
4. **Configure Esbuild** to minify production code and watch for changes (including .erb files) in development to automatically inject those changes into the running dev server.
    **First add the `chokidar` dev dependency** This will 'live inject' any CSS or JS changes in development
    ```sh
    yarn add chokidar -D
    ```

    **Create the Esbuild config file** in the project root
    ```sh
    touch esbuild.config.js
    ```
    add this to the new config file
    ```js
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
      "./app/assets/stylesheets/*.scss"
    ]
    const config = {
      absWorkingDir: path.join(process.cwd(), "app/javascript"),
      bundle: true,
      entryPoints: entryPoints,
      outdir: path.join(process.cwd(), "app/assets/builds"),
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
    ```
    ___
    **Edit `/package.json`** to use the configuration file. Change the existing scripts section to this. Note that this minifies CSS in development.
    ```js
    "scripts": {
      "build": "node esbuild.config.js",
      "build:css": "tailwindcss --postcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css --minify"
    }
    ```
    ___
    **One last change.** Edit `/Prockfile.dev` change this line
    ```sh
    js: yarn build --watch
    ```
    to
    ```sh
    js: yarn build --rebuild
    ```
5. **Start the server in dev mode** and test that everything is working
    ```sh
    bin/dev
    ```
    Running `bin/dev` will reference `/Procfile.dev` starting a new rails server listening on `http://127.0.0.1:3000` and watching for changed assets in development mode.
6. **Update your Rails environment** and install **AVO**

    Create an `.envrc` file in the root directory
    ```sh
    touch .envrc
    ```
    add this
    ```sh
    set -a; . ./.env
    rvm use ruby-3.1.2
    ```
    give `direnv` access to the environment
    ```sh
    direnv allow .
    ```
    create a `.env` file in the root directory
    ```sh
    touch .env
    ```
    add your AVO license key
    ```env
    AVO_LICENSE_KEY=<my-license-key>
    ```
    add AVO gems to your `/Gemfile`
    ```sh
    ...
    # Avo Advanced
    gem "avo", ">= 3.2.1"
    gem "avo-advanced", ">= 3.2.0", source: "https://packager.dev/avo-hq/"
    ```
    then
    ```sh
    bundle install
    ```
    Run AVO's setup to generate the initializer and add Avo to the `/config/routes.rb` file.
    ```sh
    rails g avo:install
    ```
7. **Test** your new installation
    Run
    ```sh
    bin/dev
    ```
    You should have a server running at `http://127.0.0.1:3000/` and the default AVO page will be at `http://127.0.0.1:3000/avo`