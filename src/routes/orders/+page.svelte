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
</script>

<svelte:head>
  <title>My Orders | Handy Mandy</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">My Orders & Bookings</h1>
      <p class="text-xs text-slate-500 mt-1">Track installation schedules, technician assignments, and service history</p>
    </div>
    <a
      href="/"
      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
    >
      + Book New Service
    </a>
  </div>

  {#if data.orders.length === 0}
    <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p class="text-4xl mb-2">📦</p>
      <h2 class="text-lg font-bold text-slate-800">No orders found</h2>
      <p class="text-xs text-slate-500 mt-1 mb-6">You haven't booked any smart home devices or installation packages yet.</p>
      <a
        href="/"
        class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition inline-block"
      >
        Browse Smart Home Catalog
      </a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.orders as order}
        {@const badge = getStatusBadge(order.status)}
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span class="text-xs text-slate-400 font-mono">Order ID: #{order.id}</span>
              <p class="text-xs text-slate-500 mt-0.5">
                Booked on {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold px-3 py-1 rounded-full border {badge.class}">
                {badge.text}
              </span>
              <a
                href="/orders/{order.id}"
                class="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                View Details →
              </a>
            </div>
          </div>

          <div class="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p class="text-slate-400 font-medium">Items ({order.items.length})</p>
              <p class="font-bold text-slate-900 mt-0.5 line-clamp-1">
                {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
              </p>
            </div>
            <div>
              <p class="text-slate-400 font-medium">Technician</p>
              <p class="font-bold text-slate-900 mt-0.5">
                {order.technician?.user?.name || 'Pending assignment'}
              </p>
            </div>
            <div>
              <p class="text-slate-400 font-medium">Total Price</p>
              <p class="font-black text-emerald-700 mt-0.5 text-sm">
                {formatIDR(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
