// SPDX-FileCopyrightText: 2023 Redradix - development@redradix.com
//
// SPDX-License-Identifier: MIT

import CustomElement from './index.svelte'

export default { title: 'CustomElement' }

export const CustomElementStory = () => ({
  Component: CustomElement,
})

export const CustomElementStoryWithProps = () => ({
  Component: CustomElement,
  props: {
    title: 'Hello from props!!',
  },
})
