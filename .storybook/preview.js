import '!style-loader!css-loader!sass-loader!./static/base.css'

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

export const parameters = {
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
}
