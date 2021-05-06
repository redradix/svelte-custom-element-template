const svelte = require('rollup-plugin-svelte')
const sveltePreprocess = require('svelte-preprocess')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const css = require('rollup-plugin-css-only')
const replace = require('@rollup/plugin-replace')
const livereload = require('rollup-plugin-livereload')
const terser = require('rollup-plugin-terser').terser
const shell = require('shelljs')
const fs = require('fs').promises
const path = require('path')
const rollup = require('rollup')
const packageJson = require('../package.json')

const appPath = path.resolve(__dirname, '../')
const production = !process.env.ROLLUP_WATCH
const buildPath = 'dist'
const entryPoint = `${appPath}/src/index.svelte`
const entryPointRegexp = /index\.svelte$/
const moduleName = packageJson.name
// Replace special characters for allowing scoped packages like "@scope/package"
const displayModuleName = moduleName.replace('@', '').replace('/', '-')
const moduleVersion = packageJson.version

// Used for package.json "main" property
const moduleFile = `${buildPath}/${displayModuleName}.js`

const bundleName = `${displayModuleName}.${moduleVersion}.js`

const outputOptions = {
  sourcemap: true,
  format: 'iife',
  name: 'App',
  file: `${buildPath}/${bundleName}`,
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

async function extractCSS() {
  let cssChunk = ''

  const bundle = await rollup.rollup({
    input: entryPoint,
    plugins: [
      svelte({
        compilerOptions: {
          dev: false,

          // all nested child elements are built as normal svelte components
          customElement: false,
        },
        emitCss: true,
        preprocess: sveltePreprocess(),
      }),

      // HACK! Inject nested CSS into custom element shadow root
      css({
        output(nestedCSS, styleNodes, bundle) {
          const escapedCssChunk = nestedCSS
            .replace(/\n/g, '')
            .replace(/[\\"']/g, '\\$&')
            .replace(/\u0000/g, '\\0')

          cssChunk = escapedCssChunk
        },
      }),

      ...commonRollupPlugins,
    ],
  })

  await bundle.generate(outputOptions)

  return cssChunk
}

async function buildWebComponent({ minify, cssChunk }) {
  // 1. Create a bundle
  const bundle = await rollup.rollup({
    input: entryPoint,
    plugins: [
      svelte({
        compilerOptions: {
          dev: false,

          // all nested child elements are built as normal svelte components
          customElement: false,
        },
        emitCss: true,
        exclude: entryPointRegexp,
        preprocess: sveltePreprocess(),
      }),
      svelte({
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production,

          // we're generating a -- Web Component -- from index.svelte
          customElement: true,
        },
        emitCss: false,
        include: entryPointRegexp,
        preprocess: sveltePreprocess(),
      }),

      // HACK! Inject nested CSS into custom element shadow root
      css({
        output(nestedCSS, styleNodes, bundle) {
          const code = bundle[bundleName].code

          const matches = code.match(
            minify
              ? /.shadowRoot.innerHTML='<style>(.*)<\/style>'/
              : /.shadowRoot.innerHTML = "<style>(.*)<\/style>"/,
          )

          if (matches && matches[1]) {
            const style = matches[1]
            bundle[bundleName].code = code.replace(style, cssChunk)
          } else {
            throw new Error(
              "Couldn't shadowRoot <style> tag for injecting styles",
            )
          }
        },
      }),

      // HACK! Fix svelte/transitions in web components

      // Use shadow root instead of document for transition style injecting
      replace({
        '.ownerDocument': '.getRootNode()',
        delimiters: ['', ''],
      }),

      // Append styles to shadow root
      replace({
        '.head.appendChild(e': '.appendChild(e',
        delimiters: ['', ''],
      }),

      // END HACK

      ...commonRollupPlugins,

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

  // 3. Write bundles into files
  const fileName = minify
    ? `${outputOptions.file.replace('.js', '.min.js')}`
    : outputOptions.file

  // Normal bundle
  await fs.writeFile(fileName, code)

  // Only create .map.js when code is minified
  if (minify) {
    await fs.writeFile(fileName.replace('.js', '.js.map'), map.toString())
  }

  // Generic bundle for using as module entry point
  if (!minify) {
    await fs.writeFile(moduleFile, code)
  }
}

async function main() {
  try {
    shell.mkdir('-p', buildPath)
    shell.rm('dist/*')

    const cssChunk = await extractCSS()

    // builds readable bundle of the web component
    await buildWebComponent({ minify: false, cssChunk })

    // builds minified bundle with sourcemap
    await buildWebComponent({ minify: true, cssChunk })
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }
}

main()
