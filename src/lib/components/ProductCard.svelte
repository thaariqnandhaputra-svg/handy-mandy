<script lang="ts">
  import { bookingStore } from '$lib/stores/bookingStore';

  export let product: {
    id: string;
    name: string;
    description: string;
    category: string;
    basePrice: number;
    imageUrl: string | null;
    requiresHub: boolean;
  };

  let addedAnimation = false;

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  function handleAdd() {
    bookingStore.addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      requiresHub: product.requiresHub,
      category: product.category
    }, 1);

    addedAnimation = true;
    setTimeout(() => {
      addedAnimation = false;
    }, 1500);
  }
</script>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full">
  <!-- Product Image -->
  <div class="relative h-48 w-full bg-slate-100 overflow-hidden group">
    {#if product.imageUrl}
      <img
        src={product.imageUrl}
        alt={product.name}
        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
        <span class="text-4xl">🔌</span>
      </div>
    {/if}

    <!-- Badges -->
    <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
      <span class="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
        {product.category}
      </span>
      {#if product.requiresHub}
        <span class="bg-amber-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="Requires a Zigbee Hub to operate">
          ⚠️ Hub Required
        </span>
      {/if}
    </div>
  </div>

  <!-- Content -->
  <div class="p-5 flex flex-col flex-1">
    <a href="/products/{product.id}" class="hover:text-emerald-600 transition">
      <h3 class="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-1.5">
        {product.name}
      </h3>
    </a>
    <p class="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
      {product.description}
    </p>

    <!-- Price and Action -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
      <div>
        <p class="text-xs text-slate-400 font-medium">Device Price</p>
        <p class="text-base font-extrabold text-emerald-700">
          {formatIDR(product.basePrice)}
        </p>
      </div>

      <button
        type="button"
        on:click={handleAdd}
        class="px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm {addedAnimation ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}"
      >
        {#if addedAnimation}
          <span>✓ Added</span>
        {:else}
          <span>+ Add</span>
        {/if}
      </button>
    </div>
  </div>
</div>
