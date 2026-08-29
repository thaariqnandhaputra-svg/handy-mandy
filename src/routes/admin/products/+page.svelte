<script lang="ts">
  export let data;
  export let form;

  let showAddModal = false;

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
</script>

<svelte:head>
  <title>Manage Products | Admin Handy Mandy</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Manage Product Catalog</h1>
      <p class="text-xs text-slate-500 mt-1">Add, configure, and manage active smart home installation devices</p>
    </div>
    <button
      type="button"
      on:click={() => showAddModal = !showAddModal}
      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
    >
      {showAddModal ? 'Cancel' : '+ Add New Product'}
    </button>
  </div>

  {#if form?.error}
    <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {form.error}
    </div>
  {/if}

  <!-- Add Product Modal/Card -->
  {#if showAddModal}
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-md">
      <h2 class="text-base font-bold text-slate-900 mb-4">Add New Smart Device</h2>
      <form method="POST" action="?/createProduct" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g. Smart Video Doorbell Pro"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label for="category" class="block font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              required
              placeholder="Security, Smart Access, Lighting..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="basePrice" class="block font-semibold text-slate-700 mb-1">Base Price (IDR)</label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              required
              min="10000"
              step="1000"
              placeholder="1250000"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label for="imageUrl" class="block font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label for="description" class="block font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            required
            placeholder="Key features, power requirements, compatibility..."
            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          ></textarea>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="requiresHub"
            name="requiresHub"
            class="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label for="requiresHub" class="font-medium text-slate-700">
            This device requires a Zigbee Multi-Protocol Hub to operate
          </label>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button
            type="button"
            on:click={() => showAddModal = false}
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Products List Table -->
  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
          <tr>
            <th class="py-3.5 px-4 font-bold">Product</th>
            <th class="py-3.5 px-4 font-bold">Category</th>
            <th class="py-3.5 px-4 font-bold">Price</th>
            <th class="py-3.5 px-4 font-bold">Hub Requirement</th>
            <th class="py-3.5 px-4 font-bold">Active Status</th>
            <th class="py-3.5 px-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each data.products as prod}
            <tr class="hover:bg-slate-50/70 transition">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  {#if prod.imageUrl}
                    <img src={prod.imageUrl} alt="" class="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                  {/if}
                  <div>
                    <p class="font-bold text-slate-900">{prod.name}</p>
                    <p class="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{prod.description}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                  {prod.category}
                </span>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-900">
                {formatIDR(prod.basePrice)}
              </td>
              <td class="py-3.5 px-4">
                {#if prod.requiresHub}
                  <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-amber-200">
                    ⚠️ Requires Hub
                  </span>
                {:else}
                  <span class="text-slate-400 text-[11px]">Direct WiFi</span>
                {/if}
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-full font-bold text-[10px] {prod.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
                  {prod.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <form method="POST" action="?/toggleActive" class="inline-block">
                  <input type="hidden" name="productId" value={prod.id} />
                  <button
                    type="submit"
                    class="text-xs font-semibold px-2.5 py-1 rounded-lg border transition {prod.isActive ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}"
                  >
                    {prod.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
