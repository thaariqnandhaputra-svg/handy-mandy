<script lang="ts">
  import { page } from '$app/stores';

  export let form;
</script>

<div class="max-w-md mx-auto my-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold text-slate-900">Create your account</h1>
    <p class="text-sm text-slate-500 mt-1">Book certified smart home device installations</p>
  </div>

  {#if form?.error}
    <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
      {form.error}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={form?.name || ''}
        required
        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        placeholder="e.g. Thaariq Customer"
      />
    </div>

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
      <label for="phone" class="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={form?.phone || ''}
        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        placeholder="081234567890"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        minlength="8"
        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        placeholder="••••••••"
      />
      <p class="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
    </div>

    <button
      type="submit"
      class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition text-sm"
    >
      Sign Up
    </button>
  </form>

  <p class="mt-6 text-center text-sm text-slate-600">
    Already have an account?
    <a
      href="/login{$page.url.search}"
      class="font-medium text-emerald-600 hover:text-emerald-500"
    >
      Sign in
    </a>
  </p>
</div>
