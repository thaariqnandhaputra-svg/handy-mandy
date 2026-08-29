<script lang="ts">
  export let data;

  function getStatusBadge(status: string) {
    switch (status) {
      case 'TECHNICIAN_ASSIGNED':
        return { text: 'Assigned (Ready)', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'IN_PROGRESS':
        return { text: 'In Progress (On Site)', class: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'COMPLETED':
        return { text: 'Completed', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: status, class: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  }
</script>

<svelte:head>
  <title>Technician Job Queue | Handy Mandy</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
    <span class="text-xs uppercase tracking-wider text-blue-300 font-bold">Technician Portal</span>
    <h1 class="text-2xl font-extrabold mt-1">My Assigned Installation Jobs</h1>
    {#if data.profile}
      <p class="text-xs text-blue-200 mt-1">
        City: <strong class="text-white">{data.profile.serviceCity || 'Any'}</strong> • Specialties: <strong class="text-white">{data.profile.specialties}</strong>
      </p>
    {/if}
  </div>

  {#if data.orders.length === 0}
    <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p class="text-3xl mb-1">🛠️</p>
      <h2 class="text-base font-bold text-slate-800">No jobs assigned yet</h2>
      <p class="text-xs text-slate-500 mt-1">When an admin dispatches an order to you, it will appear here.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.orders as order}
        {@const badge = getStatusBadge(order.status)}
        <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span class="text-xs font-mono text-slate-400">Job #{order.id.slice(-8)}</span>
              <h2 class="text-base font-bold text-slate-900 mt-0.5">{order.customer.name}</h2>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-full border w-fit {badge.class}">
              {badge.text}
            </span>
          </div>

          <!-- Customer Address & Contact -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <p class="text-slate-400 font-medium">📍 Service Location</p>
              <p class="font-bold text-slate-800 mt-0.5">{order.location.addressLine}</p>
              <p class="text-slate-500">{order.location.city}, {order.location.province}</p>
            </div>

            <div>
              <p class="text-slate-400 font-medium">📞 Customer Contact</p>
              <p class="font-bold text-slate-800 mt-0.5">{order.customer.email}</p>
              {#if order.customer.phone}
                <a
                  href="tel:{order.customer.phone}"
                  class="text-emerald-600 font-bold hover:underline inline-block mt-0.5"
                >
                  Call {order.customer.phone} →
                </a>
              {/if}
            </div>
          </div>

          <!-- Devices Checklist -->
          <div class="py-4 border-b border-slate-100 text-xs">
            <p class="font-bold text-slate-800 mb-2">📦 Installation Checklist:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each order.items as item}
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span class="font-medium text-slate-800">{item.product.name}</span>
                  <span class="font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                  </span>
                </div>
              {/each}
              {#if order.includeHub}
                <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 font-medium">
                  <span>Zigbee Gateway Hub Gen 3</span>
                  <span class="font-bold bg-white px-2 py-0.5 rounded border border-amber-300">1 unit</span>
                </div>
              {/if}
            </div>

            {#if order.notes}
              <div class="mt-3 p-3 bg-slate-50 rounded-xl text-slate-600">
                <strong>Customer Notes:</strong> {order.notes}
              </div>
            {/if}
          </div>

          <!-- Status Transition Buttons -->
          <div class="pt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-slate-400">
              📅 Target Date: {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('id-ID') : 'Earliest'}
            </p>

            <form method="POST" action="?/updateStatus" class="flex items-center gap-2">
              <input type="hidden" name="orderId" value={order.id} />

              {#if order.status === 'TECHNICIAN_ASSIGNED'}
                <input type="hidden" name="status" value="IN_PROGRESS" />
                <button
                  type="submit"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  🚀 Start Job (On-Site)
                </button>
              {:else if order.status === 'IN_PROGRESS'}
                <input type="hidden" name="status" value="COMPLETED" />
                <button
                  type="submit"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  ✓ Mark Installation Completed
                </button>
              {:else if order.status === 'COMPLETED'}
                <span class="text-xs font-bold text-emerald-700">✓ Work verified and completed</span>
              {/if}
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
