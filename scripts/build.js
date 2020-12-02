const svelte = require('rollup-plugin-svelte')
const sveltePreprocess = require('svelte-preprocess')
const { babel } = require('@rollup/plugin-babel')
const injectProcessEnv = require('rollup-plugin-inject-process-env')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const replace = require('@rollup/plugin-replace')
const livereload = require('rollup-plugin-livereload')
const terser = require('rollup-plugin-terser').terser
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const packageJson = require('../package.json')

const appPath = path.resolve(__dirname, '../')
const production = !process.env.ROLLUP_WATCH
const buildPath = 'dist'
const entryPoint = `${appPath}/src/index.svelte`
const entryPointRegexp = /index\.svelte$/
const moduleName = packageJson.name
const moduleVersion = packageJson.version

const outputOptions = {
  sourcemap: true,
  format: 'iife',
  name: 'App',
  file: `${buildPath}/${moduleName}.${moduleVersion}.js`,
}

const commonRollupPlugins = [
  json(),

  // If you have external dependencies installed from
  // npm, you'll most likely need these plugins. In
  // some cases you'll need additional configuration -
  // consult the documentation for details:
  // https://github.com/rollup/plugins/tree/master/packages/commonjs
  nodeResolve({
    browser: true,
    dedupe: ['svelte'],
  }),

  commonjs(),

  // transpile to ES2015+
  babel({
    extensions: ['.js', '.mjs', '.html', '.svelte'],
    babelHelpers: 'runtime',
  }),
]

async function generateNestedCSS() {
  let cssChunk

  // 1. Create a bundle
  const bundle = await rollup.rollup({
    input: entryPoint,
    plugins: [
      svelte({
        // all nested child elements are built as normal svelte components
        customElement: false,
        exclude: entryPointRegexp,
        preprocess: sveltePreprocess(),
        // Extract CSS into a variable
        css: css => (cssChunk = css.code),
      }),
      svelte({
        customElement: true,
        include: entryPointRegexp,
        preprocess: sveltePreprocess(),
      }),

      ...commonRollupPlugins,
    ],
  })

  // 2. Generate output specific code in-memory
  // You can call this function multiple times on the same bundle object
  await bundle.generate(outputOptions)

  // 3. Escape css chunk characters.
  // For embedding the chunk into the main custom element
  const escapedCssChunk = cssChunk
    .replace(/\n/g, '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0')

  return escapedCssChunk
}

async function buildWebComponent({ nestedCSS, minify }) {
  // 1. Create a bundle
  const bundle = await rollup.rollup({
    input: entryPoint,
    plugins: [
      replace({ 'module-name': moduleName }),
      svelte({
        dev: false,
        // all nested child elements are built as normal svelte components
        customElement: false,
        exclude: entryPointRegexp,
        preprocess: sveltePreprocess(),
      }),
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        // we're generating a -- Web Component -- from index.svelte
        customElement: true,
        include: entryPointRegexp,
        preprocess: sveltePreprocess(),
      }),

      ...commonRollupPlugins,

      // replaces the process.env references from the transpiled code
      injectProcessEnv({
        NODE_ENV: process.env.NODE_ENV,
      }),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload(buildPath),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      minify && terser(),
    ],
  })

  // 2. Generate output specific code in-memory
  // you can call this function multiple times on the same bundle object
  const { output } = await bundle.generate(outputOptions)
  const { code, map } = output[0]

  // 3. Inject CSS chunk into custom element shadow root
  const matches = code.match(
    minify
      ? /.shadowRoot.innerHTML='<style>(.*)<\/style>'/
      : /_this.shadowRoot.innerHTML = \"<style>(.*)<\/style>\"/,
  )

  let updatedCode = code

  if (matches && matches[1]) {
    const style = matches[1]
    updatedCode = code.replace(style, `${style}${nestedCSS}`)
  }

  // 4. HACK! Fix svelte/transitions in web components
  updatedCode = updatedCode
    // Use shadow root instead of document for transition style injecting
    .replace(/\.ownerDocument/, '.getRootNode()')
    // Append styles to shadow root
    .replace(/\.head\.appendChild/, '.appendChild')

  // 5. Write bundles into files
  const fileName = minify
    ? `${outputOptions.file.replace('.js', '.min.js')}`
    : outputOptions.file

  fs.writeFile(fileName, updatedCode, err => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })

  if (minify) {
    fs.writeFile(fileName.replace('.js', '.js.map'), map.toString(), err => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
  }
}

async function main() {
  try {
    shell.mkdir('-p', buildPath)

    const nestedCSS = await generateNestedCSS()

    // builds readable bundle of the web component
    await buildWebComponent({ nestedCSS, minify: false })

    // builds minified bundle with sourcemap
    await buildWebComponent({ nestedCSS, minify: true })
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }
}

main()
