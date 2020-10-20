module.exports = api => {
  const isTest = api.env('test')
  const targetNode = { node: 'current' }
  const targetBrowser = { browsers: '> 1.5%, IE 11, not dead' }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          // when running Jest we use the appropriate runtime otherwise
          // we'd like to polyfill features
          targets: isTest ? targetNode : targetBrowser,
        },
      ],
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  }
}
