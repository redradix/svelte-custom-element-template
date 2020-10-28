<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { isLoading, t, locale } from 'svelte-i18n'
  import setupI18N from './lib/i18n'
  import Styles from './styles.svelte'
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

  onMount(() => {
    setupI18N()
    initialized = true
  })

  onDestroy(() => {
    unsuscribeLangChange()
  })

  const changeLang = lang => () => locale.set(lang)
</script>

<style type="text/scss" lang="scss">
  h1 {
    font-family: 'Open Sans', sans-serif;
  }

  .clock-container {
    width: 500px;
  }
</style>

<Styles />

{#if $isLoading || !initialized}
  <p>Please wait...</p>
{:else}
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
{/if}

<svelte:options tag="svelte-custom-element" />
