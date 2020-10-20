<script>
  import Styles from './styles.svelte'
  import Clock from './clock/Clock.svelte'

  export let title = 'Hello world!!'
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

<h1>{title}</h1>
<div class="clock-container">
  <Clock />
</div>

<svelte:options tag="svelte-custom-element" />
