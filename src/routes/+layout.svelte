<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';

  export let data;
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
  <Navbar user={data.user} />

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>

  <footer class="bg-white border-t border-slate-200 mt-auto py-8 text-center text-sm text-slate-500">
    <div class="max-w-7xl mx-auto px-4">
      <p>© 2026 Handy Mandy — Professional Smart Home Installation & Services Platform.</p>
    </div>
  </footer>
</div>
