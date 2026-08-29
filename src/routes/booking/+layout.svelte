<script lang="ts">
  import { page } from '$app/stores';
  import BookingStepIndicator from '$lib/components/BookingStepIndicator.svelte';

  $: pathname = $page.url.pathname;

  $: currentStep = pathname.includes('/booking/location')
    ? (1 as const)
    : pathname.includes('/booking/installation')
    ? (2 as const)
    : pathname.includes('/booking/payment')
    ? (3 as const)
    : pathname.includes('/booking/confirmation')
    ? (4 as const)
    : (1 as const);
</script>

<div class="max-w-5xl mx-auto py-4">
  <BookingStepIndicator {currentStep} />
  <slot />
</div>
