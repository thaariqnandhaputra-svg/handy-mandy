<script lang="ts">
  import { bookingStore } from '$lib/stores/bookingStore';
  import ProductCard from '$lib/components/ProductCard.svelte';

  export let data;

  let quantity = 1;
  let addedAlert = false;

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  function handleAddToCart() {
    bookingStore.addItem({
      productId: data.product.id,
      name: data.product.name,
      basePrice: data.product.basePrice,
      imageUrl: data.product.imageUrl,
      requiresHub: data.product.requiresHub,
      category: data.product.category
    }, quantity);

    addedAlert = true;
    setTimeout(() => {
      addedAlert = false;
    }, 2000);
  }
</script>

<svelte:head>
  <title>{data.product.name} | Handy Mandy</title>
</svelte:head>

<div class="mb-6">
  <a href="/" class="text-sm font-medium text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
    ← Back to Catalog
  </a>
</div>

<div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-12">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
    <!-- Image Preview -->
    <div class="bg-slate-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
      {#if data.product.imageUrl}
        <img
          src={data.product.imageUrl}
          alt={data.product.name}
          class="w-full h-full object-cover"
        />
      {:else}
        <span class="text-6xl">🔌</span>
      {/if}

      {#if data.product.requiresHub}
        <div class="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          ⚠️ Requires Zigbee Hub
        </div>
      {/if}
    </div>

    <!-- Product Info & Actions -->
    <div class="flex flex-col">
      <div class="mb-4">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {data.product.category}
        </span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug mb-3">
        {data.product.name}
      </h1>

      <div class="mb-6">
        <p class="text-xs text-slate-400 font-medium">Device Base Price</p>
        <p class="text-3xl font-black text-emerald-700">
          {formatIDR(data.product.basePrice)}
        </p>
      </div>

      {#if data.product.requiresHub}
        <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-sm mb-6 flex items-start gap-3">
          <span class="text-xl">ℹ️</span>
          <div>
            <p class="font-bold">Hub Compatibility Notice</p>
            <p class="text-xs text-amber-800 mt-0.5">
              This device connects using the Zigbee protocol. If you do not have a compatible Zigbee Multi-Protocol Hub, you can conveniently add one during checkout.
            </p>
          </div>
        </div>
      {/if}

      <div class="prose prose-slate max-w-none text-slate-600 text-sm mb-8 leading-relaxed">
        <h3 class="text-slate-900 font-bold text-sm mb-2">Description & Features</h3>
        <p>{data.product.description}</p>
      </div>

      <!-- Quantity & Add to Cart CTA -->
      <div class="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div class="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 w-fit">
          <button
            type="button"
            on:click={() => quantity = Math.max(1, quantity - 1)}
            class="px-4 py-2.5 text-slate-700 hover:bg-slate-200 font-bold transition"
          >
            -
          </button>
          <span class="px-4 py-2.5 font-bold text-slate-900 text-sm min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            on:click={() => quantity = quantity + 1}
            class="px-4 py-2.5 text-slate-700 hover:bg-slate-200 font-bold transition"
          >
            +
          </button>
        </div>

        <button
          type="button"
          on:click={handleAddToCart}
          class="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition shadow-sm flex items-center justify-center gap-2 {addedAlert ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}"
        >
          {#if addedAlert}
            <span>✓ Added to Booking</span>
          {:else}
            <span>Add {quantity} to Booking Funnel</span>
          {/if}
        </button>

        <a
          href="/booking/location"
          class="py-3.5 px-6 rounded-xl font-bold text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 text-center transition"
        >
          Checkout
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Related Products -->
{#if data.relatedProducts.length > 0}
  <div>
    <h2 class="text-xl font-bold text-slate-900 mb-4">More in {data.product.category}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.relatedProducts as rel}
        <ProductCard product={rel} />
      {/each}
    </div>
  </div>
{/if}
