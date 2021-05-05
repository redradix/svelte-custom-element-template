# Svelte Custom Element Template

Svelte template for custom elements with storybook and i18n configured. Allows nested Svelte components, nested styling and Svelte transitions.

TODO:
- [x] Add [degit](https://github.com/Rich-Harris/degit) script
- [x] Document
- [ ] Add versioning scripts?
- [x] Add i18n
- [x] Configure Storybook
- [x] SCSS and Sass support
- [x] Svelte Transitions support

## Usage

### How to modify the template?

Clone it with [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit redradix/svelte-custom-element-template my-new-component
cd my-new-component

yarn install # or npm
yarn start
```

Start making your own modifications watching changes in Storybook.

### How to integrate the component in your project?

1. Build the component using `yarn build`
2. (Optional) Create a `public` folder
3. (Optional) Create an `public/index.html` file
4. Copy the built component inside a `vendor` folder (accesible from `index.html`)
5. Import the component from the HTML using the `defer` attribute
   ```html
   <script defer src="vendor/svelte-custom-element.0.1.0.min.js"></script>
   ```
6. Open the `index.html` and enjoy the web component

## Why?
Building custom elements with Svelte is really easy but have a lot of limitations, is this template I'm trying to show the way I solve most of these limitations.

Svelte current limitations:

* [Support nested custom elements](https://github.com/sveltejs/svelte/issues/3520)
* [Nested child components lose their css when the parent is used as a custom element](https://github.com/sveltejs/svelte/issues/4274)
* [Transitions in custom Elements](https://github.com/sveltejs/svelte/issues/1825)
* [Context API doesn't work for custom elements](https://github.com/sveltejs/svelte/issues/3422)

## How does this template work?

The code of your component lives inside `/src/index.svelte`, this is the main point for either Storybook and the building process. It's important that this file has it's own style tag with content in it, otherwise we cannot inject the styles of your app inside the shadow DOM of the custom element. ([read the build script](./scripts/build.js))

The global styles for your Svelte component lives inside `/src/index.scss` (concretely inside the class `component-styles-wrapper` which is the root class), this file is important because we turn it into compiled CSS and inject it to Storybook so you can have global styles in all your stories without the need to duplicate this styles.

## Available scripts

* `start`: alias of `yarn storybook`
* `build`: builds your app as a web component and outputs a minified and a normal version to `/dist`
* `storybook`: runs the storybook, this is used when develop because of the live reloading
* `test`: runs all test inside `src/` and tries to build the widget
