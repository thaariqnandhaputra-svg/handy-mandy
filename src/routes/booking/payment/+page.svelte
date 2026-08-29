<script lang="ts">
  import { bookingStore, bookingSummary } from '$lib/stores/bookingStore';

  export let data;
  export let form;

  let isSubmitting = false;

  $: selectedLocation = data.locations.find((l) => l.id === $bookingStore.locationId);

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  $: payloadString = JSON.stringify({
    locationId: $bookingStore.locationId,
    includeInstallation: $bookingStore.includeInstallation,
    includeHub: $bookingStore.includeHub,
    scheduledDate: $bookingStore.scheduledDate,
    notes: $bookingStore.notes,
    items: $bookingStore.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  });
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Left/Main Column: Order Review & Mock Payment Method -->
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-900">3. Review & Complete Payment</h2>
        <p class="text-xs text-slate-500 mt-0.5">Check all booking details before final confirmation</p>
      </div>

      {#if form?.error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {form.error}
        </div>
      {/if}

      <!-- Installation Address Card -->
      <div class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">📍 Installation Location</span>
          <a href="/booking/location" class="text-xs font-semibold text-emerald-600 hover:underline">Change</a>
        </div>
        {#if selectedLocation}
          <p class="text-sm font-bold text-slate-900">{selectedLocation.label || 'Home'}</p>
          <p class="text-xs text-slate-600 mt-0.5">{selectedLocation.addressLine}</p>
          <p class="text-xs text-slate-400">{selectedLocation.city}, {selectedLocation.province} {selectedLocation.postalCode}</p>
        {:else}
          <p class="text-xs text-red-500 font-semibold">⚠️ No address selected. Please return to Step 1.</p>
        {/if}
      </div>

      <!-- Preferred Schedule Card -->
      <div class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">📅 Preferred Schedule & Notes</span>
          <a href="/booking/installation" class="text-xs font-semibold text-emerald-600 hover:underline">Change</a>
        </div>
        <p class="text-xs text-slate-800">
          <strong class="font-semibold">Target Date:</strong> {$bookingStore.scheduledDate || 'Earliest Available (1-2 business days)'}
        </p>
        {#if $bookingStore.notes}
          <p class="text-xs text-slate-600 mt-1">
            <strong class="font-semibold">Notes:</strong> {$bookingStore.notes}
          </p>
        {/if}
      </div>

      <!-- Payment Simulation Notice & Options -->
      <div class="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
        <div class="flex items-start gap-3">
          <span class="text-2xl">💳</span>
          <div>
            <h3 class="font-bold text-emerald-950 text-sm">Instant Simulated Payment Gateway</h3>
            <p class="text-xs text-emerald-800 mt-1 leading-relaxed">
              Midtrans integration is in placeholder mode. Clicking <strong>"Confirm & Simulate Instant Payment"</strong> will simulate a successful bank settlement, create your verified order, and allocate it to our technician dispatch queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column: Final Cost Breakdown -->
  <div class="space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Order Summary
      </h3>

      <!-- Line Items -->
      <div class="space-y-3 mb-6 max-h-56 overflow-y-auto text-xs">
        {#each $bookingStore.items as item}
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-slate-800 line-clamp-1">{item.name}</p>
              <p class="text-slate-400">{item.quantity} × {formatIDR(item.basePrice)}</p>
            </div>
            <span class="font-bold text-slate-900">{formatIDR(item.basePrice * item.quantity)}</span>
          </div>
        {/each}

        {#if $bookingStore.includeInstallation}
          <div class="flex justify-between items-start text-emerald-800 bg-emerald-50/50 p-2 rounded-lg">
            <div>
              <p class="font-bold">Technician Installation</p>
              <p class="text-[11px] text-emerald-600">{$bookingSummary.totalItemsCount} units</p>
            </div>
            <span class="font-bold">{formatIDR($bookingSummary.installationFee)}</span>
          </div>
        {/if}

        {#if $bookingStore.includeHub}
          <div class="flex justify-between items-start text-emerald-800 bg-emerald-50/50 p-2 rounded-lg">
            <div>
              <p class="font-bold">Zigbee Gateway Hub Gen 3</p>
              <p class="text-[11px] text-emerald-600">1 unit hardware</p>
            </div>
            <span class="font-bold">{formatIDR($bookingSummary.hubFee)}</span>
          </div>
        {/if}
      </div>

      <div class="space-y-2 pt-3 border-t border-slate-200 text-xs">
        <div class="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatIDR($bookingSummary.subtotal)}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Additional Services</span>
          <span>{formatIDR($bookingSummary.installationFee + $bookingSummary.hubFee)}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 flex justify-between items-baseline">
          <span class="text-sm font-bold text-slate-900">Total Amount</span>
          <span class="text-xl font-black text-emerald-700">{formatIDR($bookingSummary.totalAmount)}</span>
        </div>
      </div>

      <!-- Payment Submit Form -->
      <form method="POST" action="?/processMockPayment" on:submit={() => isSubmitting = true} class="mt-6">
        <input type="hidden" name="payload" value={payloadString} />

        <button
          type="submit"
          disabled={isSubmitting || $bookingStore.items.length === 0 || !$bookingStore.locationId}
          class="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
        >
          {#if isSubmitting}
            <span class="animate-spin text-lg">⚡</span>
            <span>Processing Payment...</span>
          {:else}
            <span>Confirm & Simulate Payment</span>
            <span>✓</span>
          {/if}
        </button>
      </form>

      <a
        href="/booking/installation"
        class="block w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 mt-3 transition"
      >
        ← Back to Installation Options
      </a>
    </div>
  </div>
</div>
