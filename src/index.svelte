<svelte:options tag="svelte-custom-element" />

<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { isLoading, t, locale } from 'svelte-i18n'
  import setupI18N from './lib/i18n'
  import Clock from './clock/Clock.svelte'

  export let title = 'Hello from component!!'
  let initialized = false
  let visible = true

  const dispatch = createEventDispatcher()

  const unsuscribeLangChange = locale.subscribe(lang => {
    if (lang) {
      dispatch('language-change', lang)
    }
  })

  const fontStyleNode = document.createElement('link')

  onMount(() => {
    // HACK: Font import doesn't work inside shadow-dom.
    // Read more: https://stackoverflow.com/questions/55382081/using-google-fonts-with-shadow-dom
    fontStyleNode.type = 'text/css'
    fontStyleNode.rel = 'stylesheet'
    fontStyleNode.href =
      '//fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap'
    document.head.appendChild(fontStyleNode)

    setupI18N()
    initialized = true
  })

  onDestroy(() => {
    unsuscribeLangChange()

    // HACK: Font import doesn't work inside shadow-dom.
    document.head.removeChild(fontStyleNode)
  })

  const changeLang = lang => () => locale.set(lang)
</script>

{#if $isLoading || !initialized}
  <p>Please wait...</p>
{:else}
  <div class="component-styles-wrapper">
    <h1>{title}</h1>

    <p>{$t('text:example-paragraph')}</p>

    <button on:click={changeLang('en')}>EN</button>
    <button on:click={changeLang('es')}>ES</button>

    <button on:click={() => (visible = !visible)}>Show/hide clocky</button>

    {#if visible}
      <div class="clock-container" transition:fade>
        <Clock />
      </div>
    {/if}
  </div>
{/if}

<style global type="text/scss" lang="scss" src="./index.scss">
</style>
