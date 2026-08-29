<script lang="ts">
  import { page } from '$app/stores';

  export let form;
</script>

<div class="max-w-md mx-auto my-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
    <p class="text-sm text-slate-500 mt-1">Sign in to manage your bookings and services</p>
  </div>

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
      {form.error}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
      <input
        type="email"
        id="email"
        name="email"
        value={form?.email || ''}
        required
        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        placeholder="name@example.com"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        placeholder="••••••••"
      />
    </div>

    <button
      type="submit"
      class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition text-sm"
    >
      Sign In
    </button>
  </form>

  <div class="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-1">
    <p class="font-semibold text-slate-700">Demo Seed Accounts (Password: Password123!):</p>
    <p>• Admin: <code class="text-emerald-700 font-mono">admin@handymandy.id</code></p>
    <p>• Technician: <code class="text-emerald-700 font-mono">budi.tech@handymandy.id</code></p>
    <p>• Customer: <code class="text-emerald-700 font-mono">customer@handymandy.id</code></p>
  </div>

  <p class="mt-6 text-center text-sm text-slate-600">
    Don't have an account yet?
    <a
      href="/register{$page.url.search}"
      class="font-medium text-emerald-600 hover:text-emerald-500"
    >
      Register now
    </a>
  </p>
</div>
