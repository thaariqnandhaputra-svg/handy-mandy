<script lang="ts">
  export let currentStep: 1 | 2 | 3 | 4 = 1;

  const steps = [
    { number: 1, label: 'Location' },
    { number: 2, label: 'Installation & Hub' },
    { number: 3, label: 'Payment' },
    { number: 4, label: 'Confirmation' }
  ];
</script>

<div class="mb-8 max-w-3xl mx-auto">
  <div class="flex items-center justify-between relative">
    <!-- Connecting Line -->
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 -z-0 transition-all duration-300"
      style="width: {((currentStep - 1) / (steps.length - 1)) * 100}%"
    ></div>

    {#each steps as step}
      <div class="flex flex-col items-center relative z-10">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition {step.number === currentStep
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
            : step.number < currentStep
            ? 'bg-emerald-600 text-white'
            : 'bg-white border-2 border-slate-300 text-slate-400'}"
        >
          {#if step.number < currentStep}
            ✓
          {:else}
            {step.number}
          {/if}
        </div>
        <span
          class="text-xs font-semibold mt-2 text-center {step.number === currentStep
            ? 'text-emerald-700 font-bold'
            : step.number < currentStep
            ? 'text-slate-700'
            : 'text-slate-400'}"
        >
          {step.label}
        </span>
      </div>
    {/each}
  </div>
</div>
