# Svelte Custom Element Template

Svelte template for creating custom elements with storybook and i18n configured that uses a custom build script for allowing nested Svelte components and nested styling.

TODO:
- [x] Add [degit](https://github.com/Rich-Harris/degit) script
- [x] Document
- [ ] Add versioning scripts?
- [x] Add i18n
- [x] Configure storybook
- [x] SCSS and Sass support

## How to use?

Clone it with [degit](https://github.com/Rich-Harris/degit):

```sh
npx degit redradix/svelte-custom-element-template my-new-component
cd my-new-component
npm install # or yarn
```

The code of your component lives inside `/src/index.svelte`, this is the main point for either Storybook and the building process. It's important that this file has it's own style tag with content in it, otherwise we cannot inject the styles of your app inside the shadow DOM of the custom element. ([read the build script](./scripts/build.js))

The global styles for your Svelte component lives inside `/src/styles.svelte`, this file is important because we get the compiled CSS from this and inject it in Storybook so you can have global styles in all your stories without the need to duplicate this styles.

## Why?
Building custom elements with Svelte is really easy but have a lot of limitations, is this template I'm trying to show the way I solve most of these limitations.

Svelte current limitations:

* [Support nested custom elements](https://github.com/sveltejs/svelte/issues/3520)
* [Nested child components lose their css when the parent is used as a custom element](https://github.com/sveltejs/svelte/issues/4274)

## Available scripts

* `start`: runs the storybook, this is used when develop because of the live reloading
* `build`: builds your app as a web component and outputs a minified and a normal version to `/dist`
* `build:open`: builds your app and also runs a development server for viewing how your compiled component will look like