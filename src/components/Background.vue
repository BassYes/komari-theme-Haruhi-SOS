<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const isLoaded = ref(false)
const hasError = ref(false)

const showBackground = computed(() => appStore.backgroundEnabled)
const currentUrl = computed(() => showBackground.value ? appStore.currentBackgroundUrl : '')
const backgroundType = computed(() => appStore.backgroundType)
const hasCustomBackground = computed(() => showBackground.value && !!currentUrl.value)
const showBackgroundOverlay = computed(() => appStore.backgroundOverlay > 0)

const backgroundStyle = computed(() => {
  const blur = appStore.backgroundBlur
  return {
    filter: blur > 0 ? `blur(${blur}px)` : 'none',
    opacity: appStore.backgroundType === 'video' && !isLoaded.value ? 0 : 1,
  }
})

const backgroundContainerStyle = computed(() => {
  const overlay = appStore.backgroundOverlay
  if (overlay >= 0)
    return {}

  return { opacity: 1 - Math.abs(overlay) / 100 }
})

const overlayStyle = computed(() => {
  const overlay = appStore.backgroundOverlay
  if (overlay <= 0)
    return {}

  return { backgroundColor: `rgba(0, 0, 0, ${overlay / 100})` }
})

const showLoadedBackground = computed(() =>
  hasCustomBackground.value && isLoaded.value && !hasError.value,
)

const showMediaBackground = computed(() =>
  hasCustomBackground.value && !hasError.value && (backgroundType.value === 'video' || showLoadedBackground.value),
)

const showDefaultBackground = computed(() =>
  !hasCustomBackground.value || !showMediaBackground.value || hasError.value,
)

const showLoadingBackground = computed(() =>
  hasCustomBackground.value && backgroundType.value === 'video' && !isLoaded.value && !hasError.value,
)

const showFallbackBackground = computed(() =>
  hasCustomBackground.value && backgroundType.value === 'video' && hasError.value,
)

let imageLoader: HTMLImageElement | null = null

function clearImageLoader() {
  if (imageLoader) {
    imageLoader.onload = null
    imageLoader.onerror = null
    imageLoader = null
  }
}

function loadImage(url: string) {
  isLoaded.value = false
  hasError.value = false

  clearImageLoader()

  imageLoader = new Image()
  imageLoader.onload = () => {
    isLoaded.value = true
    hasError.value = false
  }
  imageLoader.onerror = () => {
    isLoaded.value = false
    hasError.value = true
  }
  imageLoader.src = url
}

const videoRef = ref<HTMLVideoElement | null>(null)

function resetBackgroundState() {
  clearImageLoader()

  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.removeAttribute('src')
    videoRef.value.load()
  }

  isLoaded.value = false
  hasError.value = false
}

function handleVideoLoaded() {
  isLoaded.value = true
  hasError.value = false
}
function handleVideoError() {
  isLoaded.value = false
  hasError.value = true
}

watch([showBackground, currentUrl, backgroundType], ([enabled, url, type]) => {
  if (!enabled || !url) {
    resetBackgroundState()
    return
  }

  if (type === 'image') {
    loadImage(url)
  }
  else if (type === 'video') {
    clearImageLoader()
    isLoaded.value = false
    hasError.value = false
  }
}, { immediate: true })

onUnmounted(() => {
  resetBackgroundState()
})
</script>

<template>
  <div class="background-container" :style="backgroundContainerStyle">
    <div class="gloria-nebula" aria-hidden="true" />
    <div class="gloria-stars" aria-hidden="true" />
    <div class="sos-scrim" aria-hidden="true" />
    <Transition name="fade">
      <div v-if="showDefaultBackground" class="default-background" />
    </Transition>
    <Transition name="fade">
      <div v-if="showLoadingBackground" class="background-loading" />
    </Transition>
    <Transition name="fade">
      <div v-if="showFallbackBackground" class="background-loading" />
    </Transition>
    <Transition name="fade">
      <div v-if="showMediaBackground" class="background-media" :style="backgroundStyle">
        <div
          v-if="backgroundType === 'image'"
          class="background-image"
          :style="{ backgroundImage: `url(${currentUrl})` }"
        />
        <video
          v-else-if="backgroundType === 'video'"
          ref="videoRef"
          class="background-video"
          :src="currentUrl ?? undefined"
          autoplay
          loop
          muted
          preload="auto"
          playsinline
          @loadeddata="handleVideoLoaded"
          @canplay="handleVideoLoaded"
          @error="handleVideoError"
        />
      </div>
    </Transition>
    <div v-if="showBackgroundOverlay" class="background-overlay" :style="overlayStyle" />
  </div>
</template>

<style scoped>
.background-container {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.default-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-image: url('/images/sos/haruhi-bunny-desktop.webp');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: saturate(0.96) contrast(1.02) brightness(1.03);
  transform: scale(1.01);
  transform-origin: center;
}

.dark .default-background {
  background-image: url('/images/sos/haruhi-bunny-desktop.webp');
  filter: saturate(0.9) contrast(1.08) brightness(0.56) hue-rotate(8deg);
}

.gloria-nebula,
.gloria-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gloria-nebula {
  z-index: 2;
  background:
    radial-gradient(circle at 82% 12%, rgb(255 210 74 / 0.16), transparent 34%),
    radial-gradient(circle at 8% 62%, rgb(232 74 79 / 0.13), transparent 32%),
    radial-gradient(circle at 64% 86%, rgb(76 176 190 / 0.09), transparent 32%),
    linear-gradient(135deg, rgb(255 248 231 / 0.08), rgb(143 23 35 / 0.08));
}

.dark .gloria-nebula {
  background:
    radial-gradient(circle at 82% 12%, rgb(255 210 74 / 0.18), transparent 32%),
    linear-gradient(135deg, rgb(7 16 31 / 0.12), rgb(143 23 35 / 0.16));
}

.gloria-stars {
  z-index: 3;
  opacity: 0.22;
  background-image:
    radial-gradient(circle at 18% 22%, #fff 0 1px, transparent 1.6px),
    radial-gradient(circle at 64% 35%, #ffd24a 0 1px, transparent 1.7px),
    radial-gradient(circle at 34% 78%, #e84a4f 0 1px, transparent 1.6px),
    radial-gradient(circle at 88% 67%, #4cb0be 0 1px, transparent 1.5px);
  background-size:
    180px 190px,
    260px 230px,
    310px 290px,
    220px 270px;
  animation: gloria-star-drift 36s linear infinite;
}

.dark .gloria-stars {
  opacity: 0.32;
}

@keyframes gloria-star-drift {
  to {
    transform: translate3d(-24px, 18px, 0);
  }
}

.sos-scrim {
  position: absolute;
  z-index: 4;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgb(247 237 209 / 0.72) 0%,
    rgb(247 237 209 / 0.54) 38%,
    rgb(247 237 209 / 0.18) 70%,
    rgb(247 237 209 / 0.04) 100%
  );
  pointer-events: none;
}

.dark .sos-scrim {
  background: linear-gradient(
    90deg,
    rgb(7 16 31 / 0.78) 0%,
    rgb(7 16 31 / 0.58) 40%,
    rgb(7 16 31 / 0.24) 72%,
    rgb(7 16 31 / 0.08) 100%
  );
}

@media (max-width: 768px) {
  .default-background {
    background-image: url('/images/sos/haruhi-bunny-mobile.webp');
    background-position: center top;
    transform: none;
  }

  .dark .default-background {
    background-image: url('/images/sos/haruhi-bunny-mobile.webp');
    filter: saturate(0.9) contrast(1.08) brightness(0.64);
  }

  .sos-scrim {
    background: linear-gradient(
      180deg,
      rgb(247 237 209 / 0.38) 0%,
      rgb(247 237 209 / 0.14) 44%,
      rgb(247 237 209 / 0.64) 100%
    );
  }

  .dark .sos-scrim {
    background: linear-gradient(180deg, rgb(7 16 31 / 0.18) 0%, rgb(7 16 31 / 0.34) 46%, rgb(7 16 31 / 0.8) 100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gloria-stars {
    animation: none;
  }
}

.background-loading {
  position: absolute;
  inset: 0;
  background-color: rgb(15 23 42);
}

:root:not(.dark) .background-loading {
  background:
    radial-gradient(circle at 50% 0%, rgb(16 185 129 / 0.08), transparent 36%),
    linear-gradient(180deg, rgb(203 213 225), rgb(148 163 184));
}

.background-media {
  position: absolute;
  inset: 0;
  transition: opacity 0.8s ease;
}

.background-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
