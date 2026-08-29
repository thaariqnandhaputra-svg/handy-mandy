<script lang="ts">
  import { goto } from '$app/navigation';
  import { bookingStore, bookingSummary } from '$lib/stores/bookingStore';

  let includeInstallation = $bookingStore.includeInstallation;
  let includeHub = $bookingStore.includeHub;
  let scheduledDate = $bookingStore.scheduledDate || '';
  let notes = $bookingStore.notes || '';

  // Auto-suggest hub if any product requires it
  $: if ($bookingSummary.hasHubRequiredProduct && !includeHub && !$bookingStore.includeHub) {
    // Keep user's selection or initial default
  }

  function handleToggleInstallation() {
    includeInstallation = !includeInstallation;
    bookingStore.setInstallationOptions({ includeInstallation });
  }

  function handleToggleHub() {
    includeHub = !includeHub;
    bookingStore.setInstallationOptions({ includeHub });
  }

  function handleContinue() {
    bookingStore.setInstallationOptions({ includeInstallation, includeHub });
    bookingStore.setSchedule(scheduledDate || null, notes || null);
    goto('/booking/payment');
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
  <!-- Main Configuration Panel -->
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-900">2. Configure Installation & Add-ons</h2>
        <p class="text-xs text-slate-500 mt-0.5">Customize certified labor, hub hardware, and technician scheduling</p>
      </div>

      <!-- Installation Toggle Card -->
      <div class="p-5 rounded-2xl border transition mb-4 {includeInstallation ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-white'}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">🛠️</span>
              <h3 class="font-bold text-slate-900 text-sm">Professional Technician Installation</h3>
            </div>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              Includes full device unboxing, physical mounting, power/wiring setup, WiFi configuration, smart app pairing, and 30-day labor warranty.
            </p>
            <p class="text-xs font-bold text-emerald-700 mt-2">
              + {formatIDR(150000)} per device unit ({$bookingSummary.totalItemsCount} units = {formatIDR($bookingSummary.totalItemsCount * 150000)})
            </p>
          </div>

          <button
            type="button"
            on:click={handleToggleInstallation}
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {includeInstallation ? 'bg-emerald-600' : 'bg-slate-300'}"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {includeInstallation ? 'translate-x-5' : 'translate-x-0'}"
            ></span>
          </button>
        </div>
      </div>

      <!-- Hub Addon Toggle Card -->
      <div class="p-5 rounded-2xl border transition mb-6 {includeHub ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-white'}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">📡</span>
              <h3 class="font-bold text-slate-900 text-sm">Zigbee Multi-Protocol Gateway Hub Gen 3</h3>
            </div>
            {#if $bookingSummary.hasHubRequiredProduct}
              <div class="my-1.5 inline-block bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                ⚠️ Required by items in your cart
              </div>
            {/if}
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              Enables local automation, ultra-fast response times, and connects all Zigbee 3.0 / Bluetooth mesh sensors to your home network.
            </p>
            <p class="text-xs font-bold text-emerald-700 mt-2">
              + {formatIDR(450000)} (1 Unit Hardware + Lifetime Local Gateway)
            </p>
          </div>

          <button
            type="button"
            on:click={handleToggleHub}
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {includeHub ? 'bg-emerald-600' : 'bg-slate-300'}"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {includeHub ? 'translate-x-5' : 'translate-x-0'}"
            ></span>
          </button>
        </div>
      </div>

      <!-- Preferred Schedule & Technician Notes -->
      <div class="border-t border-slate-100 pt-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-900">Preferred Schedule & Notes</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="scheduledDate" class="block text-xs font-medium text-slate-700 mb-1">
              Preferred Installation Date
            </label>
            <input
              type="date"
              id="scheduledDate"
              bind:value={scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label for="notes" class="block text-xs font-medium text-slate-700 mb-1">
              Special Instructions for Technician
            </label>
            <input
              type="text"
              id="notes"
              bind:value={notes}
              placeholder="e.g. Unit 4B, please call upon arrival"
              class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Summary Sidebar -->
  <div class="space-y-6">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Estimated Price Summary
      </h3>

      <div class="space-y-3 text-xs">
        <div class="flex justify-between text-slate-600">
          <span>Devices ({$bookingSummary.totalItemsCount} items)</span>
          <span class="font-bold text-slate-900">{formatIDR($bookingSummary.subtotal)}</span>
        </div>

        <div class="flex justify-between text-slate-600">
          <span>Professional Installation</span>
          <span class="font-bold {includeInstallation ? 'text-emerald-700' : 'text-slate-400'}">
            {includeInstallation ? formatIDR($bookingSummary.installationFee) : 'None'}
          </span>
        </div>

        <div class="flex justify-between text-slate-600">
          <span>Zigbee Gateway Hub</span>
          <span class="font-bold {includeHub ? 'text-emerald-700' : 'text-slate-400'}">
            {includeHub ? formatIDR($bookingSummary.hubFee) : 'None'}
          </span>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-between items-baseline">
          <span class="text-sm font-bold text-slate-900">Total Booking Price</span>
          <span class="text-lg font-black text-emerald-700">{formatIDR($bookingSummary.totalAmount)}</span>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3">
        <button
          type="button"
          on:click={handleContinue}
          class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2"
        >
          <span>Continue to Payment</span>
          <span>→</span>
        </button>

        <a
          href="/booking/location"
          class="w-full py-2.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          ← Back to Address Selection
        </a>
      </div>
    </div>
  </div>
</div>
