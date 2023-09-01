<script>
	import Header from './Header.svelte';
  import "./app.css";
</script>

<div class="app flex p-6 items-center h-full flex-col">
	<Header />

	<main class="flex flex-col w-3/5 items-center">
		
		<slot />

	</main>

	<footer>

	</footer>
</div>

<style>
	.app {
		font-family: system-ui, sans-serif;
		background-size: 224px;
	}
</style>