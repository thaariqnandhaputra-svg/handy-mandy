<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { bookingStore, bookingSummary } from '$lib/stores/bookingStore';

  export let data;
</script>

<svelte:head>
  <title>Handy Mandy | Professional Smart Home Installation & Services</title>
</svelte:head>

<!-- Hero Section -->
<section class="mb-10 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
  <div class="relative z-10 max-w-2xl">
    <span class="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 mb-4">
      🛡️ Certified Technician Installation Guarantee
    </span>
    <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
      Upgrade your home to smart living, hassle-free.
    </h1>
    <p class="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
      Choose the best smart security, lighting, and automation devices. Our certified technicians will deliver, install, wire, and test everything at your doorstep.
    </p>
    <div class="flex flex-wrap gap-4">
      <a
        href="#catalog"
        class="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition"
      >
        Browse Catalog
      </a>
      <a
        href="/booking/location"
        class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition flex items-center gap-2"
      >
        <span>View In-Progress Booking</span>
        {#if $bookingSummary.totalItemsCount > 0}
          <span class="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
            {$bookingSummary.totalItemsCount}
          </span>
        {/if}
      </a>
    </div>
  </div>

  <!-- Decorative Gradient circles -->
  <div class="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute right-32 -bottom-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
</section>

<!-- Category Pills / Filter -->
<div id="catalog" class="mb-8 flex items-center justify-between flex-wrap gap-4 scroll-mt-24">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Featured Smart Devices</h2>
    <p class="text-sm text-slate-500">Pick devices for your custom installation package</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <a
      href="/"
      class="px-4 py-2 rounded-xl text-xs font-semibold transition {!data.activeCategory ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}"
    >
      All Products
    </a>
    {#each data.categories as cat}
      <a
        href="/?category={encodeURIComponent(cat)}"
        class="px-4 py-2 rounded-xl text-xs font-semibold transition {data.activeCategory === cat ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}"
      >
        {cat}
      </a>
    {/each}
  </div>
</div>

<!-- Product Grid -->
{#if data.products.length === 0}
  <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
    <p class="text-4xl mb-2">🔍</p>
    <h3 class="text-lg font-bold text-slate-800">No products found</h3>
    <p class="text-sm text-slate-500 mt-1">Try selecting a different category.</p>
  </div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each data.products as product}
      <ProductCard {product} />
    {/each}
  </div>
{/if}

<!-- Sticky Bottom Cart Banner if items exist -->
{#if $bookingSummary.totalItemsCount > 0}
  <div class="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40">
    <div class="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
      <div>
        <p class="text-xs text-slate-400">
          {$bookingSummary.totalItemsCount} item{$bookingSummary.totalItemsCount > 1 ? 's' : ''} in your booking
        </p>
        <p class="text-base font-extrabold text-emerald-400">
          Subtotal: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format($bookingSummary.subtotal)}
        </p>
      </div>

      <a
        href="/booking/location"
        class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-sm flex items-center gap-1.5"
      >
        <span>Continue to Book</span>
        <span>→</span>
      </a>
    </div>
  </div>
{/if}
