<script lang="ts">
  import { page } from '$app/stores';
  import { bookingStore, bookingSummary } from '$lib/stores/bookingStore';

  export let user: { id: string; email: string; name: string; role: string } | null = null;
</script>

<header class="bg-white border-b border-slate-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <!-- Logo & Main Nav -->
      <div class="flex items-center space-x-8">
        <a href="/" class="flex items-center space-x-2">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ⚡
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
            Handy Mandy
          </span>
        </a>

        <nav class="hidden md:flex space-x-6">
          <a
            href="/"
            class="text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
          >
            Catalog
          </a>
          {#if user}
            <a
              href="/orders"
              class="text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
            >
              My Orders
            </a>
          {/if}

          {#if user?.role === 'ADMIN'}
            <a
              href="/admin/orders"
              class="text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 hover:bg-amber-100 transition"
            >
              Admin Dashboard
            </a>
            <a
              href="/admin/products"
              class="text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
            >
              Manage Products
            </a>
          {/if}

          {#if user?.role === 'TECHNICIAN' || user?.role === 'ADMIN'}
            <a
              href="/technician/orders"
              class="text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition"
            >
              Technician Jobs
            </a>
          {/if}
        </nav>
      </div>

      <!-- Right Nav / Cart & Auth Actions -->
      <div class="flex items-center space-x-4">
        <!-- Booking Cart Shortcut -->
        <a
          href="/booking/location"
          class="relative flex items-center space-x-2 text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span class="hidden sm:inline">Booking</span>
          {#if $bookingSummary.totalItemsCount > 0}
            <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full">
              {$bookingSummary.totalItemsCount}
            </span>
          {/if}
        </a>

        {#if user}
          <div class="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
              <p class="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <form action="/logout" method="POST">
              <button
                type="submit"
                class="text-sm text-slate-600 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition"
              >
                Sign Out
              </button>
            </form>
          </div>
        {:else}
          <div class="flex items-center space-x-2">
            <a
              href="/login"
              class="text-sm font-medium text-slate-700 hover:text-emerald-600 px-3 py-2"
            >
              Sign In
            </a>
            <a
              href="/register"
              class="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm transition"
            >
              Register
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>
