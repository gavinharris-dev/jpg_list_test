<script lang="ts">
  export let label: string;
  export let value: string | number;
</script>

<div class="join">
  <label for="#inp1" class="border border-warning text-center h-full p-2 align-middle join-item w-48">{label}</label>
  <input id="inp1" type="text" placeholder={label} class="input input-bordered w-full join-item" bind:value={value} />
</div>