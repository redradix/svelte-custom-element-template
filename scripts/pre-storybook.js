const svelte = require('rollup-plugin-svelte')
const sveltePreprocess = require('svelte-preprocess')
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const rollup = require('rollup')

const appPath = path.resolve(__dirname, '../')
const entryPoint = `${appPath}/src/styles.svelte`
const baseCssPath = `${appPath}/.storybook/static/base.css`

const outputOptions = {
  sourcemap: true,
  format: 'iife',
  name: 'App',
  file: '',
}

// Generate global styles CSS for storybook

async function injectGlobalStylesToStorybook() {
  let cssChunk

  const bundle = await rollup.rollup({
    input: entryPoint,
    plugins: [
      svelte({
        customElement: false,
        preprocess: sveltePreprocess(),
        // Extract CSS into a variable
        css: css => (cssChunk = css.code.replace(/\n/g, '')),
      }),
    ],
  })

  // Ignore all bundle errors.
  // We are just interested in CSS extraction and processing
  try {
    await bundle.generate(outputOptions)
  } finally {
    shell.mkdir('-p', `${appPath}/.storybook/static`)

    fs.writeFileSync(baseCssPath, cssChunk, err => {
      if (err) {
        throw err
      }
    })
  }
}

injectGlobalStylesToStorybook()
