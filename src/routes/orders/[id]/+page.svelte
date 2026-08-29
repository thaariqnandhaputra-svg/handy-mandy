<script lang="ts">
  export let data;

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { text: 'Pending Payment', class: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { text: 'Confirmed', class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'TECHNICIAN_ASSIGNED':
        return { text: 'Technician Assigned', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'IN_PROGRESS':
        return { text: 'Installation In Progress', class: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'COMPLETED':
        return { text: 'Completed', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED':
        return { text: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { text: status, class: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  }

  $: badge = getStatusBadge(data.order.status);
</script>

<svelte:head>
  <title>Order #{data.order.id.slice(-6)} | Handy Mandy</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <a href="/orders" class="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
      ← Back to My Orders
    </a>
    <span class="text-xs font-bold px-3 py-1 rounded-full border {badge.class}">
      {badge.text}
    </span>
  </div>

  <!-- Header Card -->
  <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
    <h1 class="text-xl font-bold text-slate-900">Order #{data.order.id}</h1>
    <p class="text-xs text-slate-400 mt-0.5">
      Placed on {new Date(data.order.createdAt).toLocaleString('id-ID')}
    </p>

    <!-- Technician Dispatch Card -->
    <div class="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Technician Status</h2>
      {#if data.order.technician}
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-sm font-bold text-slate-900">{data.order.technician.user.name}</p>
            <p class="text-xs text-slate-500">Specialties: {data.order.technician.specialties}</p>
          </div>
          {#if data.order.technician.user.phone}
            <a
              href="tel:{data.order.technician.user.phone}"
              class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-block text-center"
            >
              📞 Call ({data.order.technician.user.phone})
            </a>
          {/if}
        </div>
      {:else}
        <p class="text-xs text-slate-600">
          Our dispatch team is currently assigning an available certified technician in your city.
        </p>
      {/if}
    </div>

    <!-- Location & Schedule -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs">
      <div>
        <p class="text-slate-400 font-medium">Installation Address</p>
        <p class="font-bold text-slate-800 mt-0.5">{data.order.location.label || 'Home'}</p>
        <p class="text-slate-600">{data.order.location.addressLine}</p>
        <p class="text-slate-400">{data.order.location.city}, {data.order.location.province}</p>
      </div>
      <div>
        <p class="text-slate-400 font-medium">Scheduled Target</p>
        <p class="font-bold text-slate-800 mt-0.5">
          {data.order.scheduledDate ? new Date(data.order.scheduledDate).toLocaleDateString('id-ID', { dateStyle: 'full' }) : 'Standard Dispatch'}
        </p>
        {#if data.order.notes}
          <p class="text-slate-500 mt-1"><strong class="text-slate-700">Notes:</strong> {data.order.notes}</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Items Breakdown -->
  <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
    <h2 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
      Ordered Devices & Add-ons
    </h2>

    <div class="space-y-3 text-xs mb-6">
      {#each data.order.items as item}
        <div class="flex justify-between items-center py-2 border-b border-slate-50">
          <div class="flex items-center gap-3">
            {#if item.product.imageUrl}
              <img src={item.product.imageUrl} alt="" class="w-10 h-10 object-cover rounded-lg bg-slate-100" />
            {/if}
            <div>
              <p class="font-bold text-slate-800">{item.product.name}</p>
              <p class="text-slate-400">{item.quantity} × {formatIDR(item.unitPrice)}</p>
            </div>
          </div>
          <span class="font-bold text-slate-900">{formatIDR(item.quantity * item.unitPrice)}</span>
        </div>
      {/each}

      {#if data.order.includeInstallation}
        <div class="flex justify-between items-center py-2 text-emerald-800">
          <div>
            <p class="font-bold">Professional Installation</p>
            <p class="text-[11px] text-emerald-600">Full on-site setup and testing</p>
          </div>
          <span class="font-bold">{formatIDR(data.order.installationFee)}</span>
        </div>
      {/if}

      {#if data.order.includeHub}
        <div class="flex justify-between items-center py-2 text-emerald-800">
          <div>
            <p class="font-bold">Zigbee Multi-Protocol Gateway Hub</p>
            <p class="text-[11px] text-emerald-600">1 Unit Hardware Included</p>
          </div>
          <span class="font-bold">{formatIDR(data.order.hubFee)}</span>
        </div>
      {/if}
    </div>

    <div class="pt-4 border-t border-slate-200 flex justify-between items-baseline">
      <span class="text-sm font-bold text-slate-900">Total Amount</span>
      <span class="text-xl font-black text-emerald-700">{formatIDR(data.order.totalAmount)}</span>
    </div>
  </div>
</div>
