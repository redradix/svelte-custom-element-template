import '!style-loader!css-loader!sass-loader!../src/index.scss'

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { addDecorator } from '@storybook/svelte'
import StylesDecorator from './StylesDecorator.svelte'

addDecorator(storyFn => {
  const { Component, props, on, WrapperData } = storyFn()

  return {
    Component,
    props,
    on,
    Wrapper: StylesDecorator,
    WrapperData,
  }
})

export const parameters = {
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
}
