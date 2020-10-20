const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  stories: ['../src/**/*.stories.[tj]s', '../src/**/*.story.[tj]s'],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-viewport/register',
    '@storybook/addon-storysource',
  ],
  webpackFinal: async (config, { configType }) => {
    let j
    // Find svelteloader from the webpack config
    const svelteloader = config.module.rules.find((r, i) => {
      if (r.loader && r.loader.includes('svelte-loader')) {
        j = i
        return true
      }
    })

    // safely inject preprocess into the config
    config.module.rules[j] = {
      ...svelteloader,
      options: {
        ...svelteloader.options,
        preprocess: sveltePreprocess(),
      },
    }

    // return the overridden config
    return config
  },
}
