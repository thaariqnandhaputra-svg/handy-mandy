<script lang="ts">
  export let data;
  export let form;

  let filterStatus = 'ALL';

  function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  $: filteredOrders = filterStatus === 'ALL'
    ? data.orders
    : data.orders.filter((o) => o.status === filterStatus);

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { text: 'Pending Payment', class: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { text: 'Needs Dispatch', class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'TECHNICIAN_ASSIGNED':
        return { text: 'Assigned', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'IN_PROGRESS':
        return { text: 'In Progress', class: 'bg-purple-100 text-purple-800 border-purple-200' };
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
  <title>Admin Orders & Dispatch | Handy Mandy</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Order Dispatch Dashboard</h1>
      <p class="text-xs text-slate-500 mt-1">Review customer bookings and assign certified local technicians</p>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap gap-2">
      {#each ['ALL', 'CONFIRMED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as status}
        <button
          type="button"
          on:click={() => filterStatus = status}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition {filterStatus === status
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"
        >
          {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
        </button>
      {/each}
    </div>
  </div>

  {#if form?.error}
    <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {form.error}
    </div>
  {/if}

  {#if filteredOrders.length === 0}
    <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
      <p class="text-3xl mb-1">📋</p>
      <p class="text-sm font-bold text-slate-800">No orders match filter "{filterStatus}"</p>
    </div>
  {:else}
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4 font-bold">Order / Customer</th>
              <th class="py-3.5 px-4 font-bold">Location</th>
              <th class="py-3.5 px-4 font-bold">Items & Total</th>
              <th class="py-3.5 px-4 font-bold">Status</th>
              <th class="py-3.5 px-4 font-bold">Assigned Technician</th>
              <th class="py-3.5 px-4 font-bold">Quick Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each filteredOrders as order}
              {@const badge = getStatusBadge(order.status)}
              <tr class="hover:bg-slate-50/70 transition">
                <!-- Order & Customer -->
                <td class="py-4 px-4 align-top">
                  <p class="font-mono font-bold text-slate-900">#{order.id.slice(-8)}</p>
                  <p class="font-semibold text-slate-800 mt-1">{order.customer.name}</p>
                  <p class="text-[11px] text-slate-400">{order.customer.email}</p>
                  {#if order.customer.phone}
                    <p class="text-[11px] text-slate-500">{order.customer.phone}</p>
                  {/if}
                </td>

                <!-- Location -->
                <td class="py-4 px-4 align-top max-w-[200px]">
                  <p class="font-bold text-slate-800">{order.location.city}</p>
                  <p class="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{order.location.addressLine}</p>
                  {#if order.scheduledDate}
                    <p class="text-[10px] text-emerald-700 font-semibold mt-1">
                      📅 {new Date(order.scheduledDate).toLocaleDateString('id-ID')}
                    </p>
                  {/if}
                </td>

                <!-- Items & Total -->
                <td class="py-4 px-4 align-top">
                  <div class="space-y-0.5 mb-1.5">
                    {#each order.items as item}
                      <p class="text-[11px] text-slate-700">
                        <span class="font-bold">{item.quantity}x</span> {item.product.name}
                      </p>
                    {/each}
                    {#if order.includeInstallation}
                      <span class="inline-block text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                        + Install
                      </span>
                    {/if}
                    {#if order.includeHub}
                      <span class="inline-block text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold ml-1">
                        + Hub
                      </span>
                    {/if}
                  </div>
                  <p class="font-extrabold text-emerald-700 text-sm">
                    {formatIDR(order.totalAmount)}
                  </p>
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-4 align-top">
                  <span class="inline-block px-2.5 py-1 rounded-full font-bold text-[10px] border {badge.class}">
                    {badge.text}
                  </span>
                </td>

                <!-- Assign Technician Form -->
                <td class="py-4 px-4 align-top min-w-[200px]">
                  <form method="POST" action="?/assignTechnician" class="space-y-1.5">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="technicianId"
                      class="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Unassigned --</option>
                      {#each data.technicians as tech}
                        <option
                          value={tech.id}
                          selected={order.technicianId === tech.id}
                        >
                          {tech.user.name} ({tech.serviceCity || 'Any'} - {tech.specialties})
                        </option>
                      {/each}
                    </select>
                    <button
                      type="submit"
                      class="w-full px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-[11px] transition shadow-sm"
                    >
                      Dispatch Technician
                    </button>
                  </form>
                </td>

                <!-- Quick Status Actions -->
                <td class="py-4 px-4 align-top">
                  <form method="POST" action="?/updateOrderStatus" class="space-y-1">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      value={order.status}
                      on:change={(e) => e.currentTarget.form?.submit()}
                      class="text-[11px] py-1 px-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="TECHNICIAN_ASSIGNED">TECHNICIAN_ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </form>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
