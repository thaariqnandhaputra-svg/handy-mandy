<script lang="ts">
  import { goto } from '$app/navigation';
  import { bookingStore, bookingSummary } from '$lib/stores/bookingStore';

  export let data;
  export let form;

  let showNewAddressModal = false;
  let selectedLocationId = $bookingStore.locationId || (data.locations.length > 0 ? data.locations[0].id : null);

  $: if (form?.createdLocationId) {
    selectedLocationId = form.createdLocationId;
    bookingStore.setLocation(form.createdLocationId);
    showNewAddressModal = false;
  }

  function handleSelectLocation(id: string) {
    selectedLocationId = id;
    bookingStore.setLocation(id);
  }

  function handleContinue() {
    if (!selectedLocationId) {
      alert('Please select or add an installation address.');
      return;
    }
    bookingStore.setLocation(selectedLocationId);
    goto('/booking/installation');
  }

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Left/Main Column: Address Selection -->
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900">1. Select Installation Address</h2>
          <p class="text-xs text-slate-500 mt-0.5">Where should our technician perform the installation?</p>
        </div>
        <button
          type="button"
          on:click={() => showNewAddressModal = !showNewAddressModal}
          class="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
        >
          {showNewAddressModal ? 'Cancel' : '+ Add New Address'}
        </button>
      </div>

      {#if showNewAddressModal}
        <div class="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Add New Address</h3>

          {#if form?.error}
            <div class="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {form.error}
            </div>
          {/if}

          <form method="POST" action="?/createLocation" class="space-y-3">
            <div>
              <label for="label" class="block text-xs font-medium text-slate-700 mb-1">Address Label (e.g. Home, Office)</label>
              <input
                type="text"
                id="label"
                name="label"
                placeholder="Main Residence"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label for="addressLine" class="block text-xs font-medium text-slate-700 mb-1">Full Street Address</label>
              <textarea
                id="addressLine"
                name="addressLine"
                required
                rows="2"
                placeholder="Jl. Senopati No. 45, Kebayoran Baru"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label for="city" class="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="Jakarta Selatan"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label for="province" class="block text-xs font-medium text-slate-700 mb-1">Province</label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  required
                  placeholder="DKI Jakarta"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label for="postalCode" class="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  placeholder="12190"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div class="pt-2 flex justify-end">
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
              >
                Save & Select Address
              </button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Saved Addresses List -->
      {#if data.locations.length === 0}
        <div class="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-2xl mb-1">📍</p>
          <p class="text-sm font-bold text-slate-800">No saved addresses yet</p>
          <p class="text-xs text-slate-500 mt-0.5">Please add your installation address above to proceed.</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each data.locations as loc}
            <label
              class="flex items-start p-4 rounded-2xl border transition cursor-pointer {selectedLocationId === loc.id
                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <input
                type="radio"
                name="selectedAddress"
                value={loc.id}
                checked={selectedLocationId === loc.id}
                on:change={() => handleSelectLocation(loc.id)}
                class="mt-1 text-emerald-600 focus:ring-emerald-500"
              />
              <div class="ml-3.5 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">{loc.label || 'Address'}</span>
                  {#if loc.city}
                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {loc.city}
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">{loc.addressLine}</p>
                <p class="text-xs text-slate-400 mt-0.5">{loc.province}, {loc.postalCode}</p>
              </div>
            </label>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Column: Cart Breakdown & Step Action -->
  <div class="space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Selected Devices ({$bookingSummary.totalItemsCount})
      </h3>

      {#if $bookingStore.items.length === 0}
        <div class="text-center py-6 text-slate-500 text-xs">
          <p class="mb-2">Your booking cart is empty.</p>
          <a href="/" class="text-emerald-600 font-bold hover:underline">← Browse catalog</a>
        </div>
      {:else}
        <div class="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {#each $bookingStore.items as item}
            <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
              <div class="flex-1 pr-2">
                <p class="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                <p class="text-slate-400">{item.quantity} × {formatIDR(item.basePrice)}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">{formatIDR(item.basePrice * item.quantity)}</span>
                <button
                  type="button"
                  on:click={() => bookingStore.removeItem(item.productId)}
                  class="text-slate-400 hover:text-red-600 p-1"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          {/each}
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>Devices Subtotal</span>
            <span class="font-bold text-slate-900">{formatIDR($bookingSummary.subtotal)}</span>
          </div>
        </div>

        <button
          type="button"
          on:click={handleContinue}
          disabled={$bookingStore.items.length === 0 || !selectedLocationId}
          class="w-full mt-6 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2"
        >
          <span>Continue to Installation</span>
          <span>→</span>
        </button>
      {/if}
    </div>
  </div>
</div>
