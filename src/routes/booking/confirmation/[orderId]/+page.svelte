<script lang="ts">
  import { onMount } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';

  export let data;

  onMount(() => {
    // Reset booking draft cart upon reaching confirmation
    bookingStore.reset();
  });

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }
</script>

<svelte:head>
  <title>Booking Confirmed #{data.order.id.slice(-6)} | Handy Mandy</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-8">
  <!-- Success Header Card -->
  <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm relative overflow-hidden">
    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
      ✓
    </div>
    <span class="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
      Payment & Booking Confirmed
    </span>
    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
      Thank you for your order!
    </h1>
    <p class="text-sm text-slate-500 mt-2 max-w-md mx-auto">
      Order <span class="font-mono font-bold text-slate-800">#{data.order.id}</span> has been received and added to our installation dispatch queue.
    </p>
  </div>

  <!-- Dispatch & Technician Status Card -->
  <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
    <h2 class="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
      <span>🚀</span>
      <span>Installation Dispatch Status</span>
    </h2>

    {#if data.order.technician}
      <div class="bg-white/10 rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Assigned Technician</span>
          <p class="text-lg font-bold text-white mt-0.5">{data.order.technician.user.name}</p>
          <p class="text-xs text-slate-300">Specialties: {data.order.technician.specialties}</p>
        </div>
        {#if data.order.technician.user.phone}
          <a
            href="tel:{data.order.technician.user.phone}"
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Call Technician ({data.order.technician.user.phone})
          </a>
        {/if}
      </div>
    {:else}
      <div class="bg-white/10 rounded-2xl p-4 border border-white/15">
        <p class="text-sm font-semibold text-white">Pending Dispatch Assignment</p>
        <p class="text-xs text-slate-300 mt-1">
          Our team is currently reviewing qualified technicians in <strong class="text-white">{data.order.location.city}</strong> for your scheduled slot. You will receive an update once a technician is assigned.
        </p>
      </div>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-xs">
      <div>
        <p class="text-slate-400 font-medium">Scheduled Date:</p>
        <p class="font-bold text-white mt-0.5">
          {data.order.scheduledDate ? new Date(data.order.scheduledDate).toLocaleDateString('id-ID', { dateStyle: 'full' }) : 'Standard Dispatch (1-2 Days)'}
        </p>
      </div>
      <div>
        <p class="text-slate-400 font-medium">Installation Address:</p>
        <p class="font-bold text-white mt-0.5">
          {data.order.location.addressLine}, {data.order.location.city}
        </p>
      </div>
    </div>
  </div>

  <!-- Order Receipt / Breakdown -->
  <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
    <h3 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
      Invoice Receipt
    </h3>

    <div class="space-y-3 text-xs mb-6">
      {#each data.order.items as item}
        <div class="flex justify-between items-center py-1 border-b border-slate-50">
          <div>
            <p class="font-bold text-slate-800">{item.product.name}</p>
            <p class="text-slate-400">{item.quantity} × {formatIDR(item.unitPrice)}</p>
          </div>
          <span class="font-bold text-slate-900">{formatIDR(item.quantity * item.unitPrice)}</span>
        </div>
      {/each}

      {#if data.order.includeInstallation}
        <div class="flex justify-between items-center py-1 text-emerald-800">
          <div>
            <p class="font-bold">Professional Installation Service</p>
            <p class="text-[11px] text-emerald-600">Full wiring & mounting warranty</p>
          </div>
          <span class="font-bold">{formatIDR(data.order.installationFee)}</span>
        </div>
      {/if}

      {#if data.order.includeHub}
        <div class="flex justify-between items-center py-1 text-emerald-800">
          <div>
            <p class="font-bold">Zigbee Multi-Protocol Gateway Hub</p>
            <p class="text-[11px] text-emerald-600">Hardware & gateway setup</p>
          </div>
          <span class="font-bold">{formatIDR(data.order.hubFee)}</span>
        </div>
      {/if}
    </div>

    <div class="pt-4 border-t border-slate-200 flex justify-between items-baseline">
      <span class="text-sm font-bold text-slate-900">Total Paid (IDR)</span>
      <span class="text-2xl font-black text-emerald-700">{formatIDR(data.order.totalAmount)}</span>
    </div>

    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <a
        href="/orders"
        class="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-sm shadow-sm transition"
      >
        View in My Orders
      </a>
      <a
        href="/"
        class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center text-sm transition"
      >
        Return to Catalog
      </a>
    </div>
  </div>
</div>
