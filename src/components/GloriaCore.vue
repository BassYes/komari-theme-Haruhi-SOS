<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GloriaWorldMap from '@/components/GloriaWorldMap.vue'
import SOSMark from '@/components/SOSMark.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ nodes?: NodeData[] }>()
const appStore = useAppStore()
const easterActive = ref(false)
const easterVariant = ref<'reflection' | 'wedding'>('wedding')
let easterTimer: ReturnType<typeof setTimeout> | null = null
const isReflectionEaster = computed(() => easterVariant.value === 'reflection')
const easterSource = computed(() => isReflectionEaster.value
  ? '/images/sos/haruhi-bunny-desktop.webp'
  : appStore.gloriaHeroUrl || '/images/sos/haruhi-bunny-mobile.webp')
const easterType = computed(() => isReflectionEaster.value ? 'image' : appStore.gloriaHeroUrl ? appStore.gloriaHeroType : 'image')
const easterAlt = computed(() => isReflectionEaster.value
  ? '兔女郎凉宫春日夕阳活动室背景'
  : '兔女郎凉宫春日夜间舞台背景')
const easterMessage = computed(() => isReflectionEaster.value ? appStore.easterAvatarSlogan : appStore.easterMapSlogan)
const easterSloganStyle = computed(() => {
  const min = Math.min(appStore.easterSloganMin, appStore.easterSloganMax)
  const max = Math.max(appStore.easterSloganMin, appStore.easterSloganMax)
  return { fontSize: `clamp(${min}rem, ${appStore.easterSloganFluid}vw, ${max}rem)` }
})

function revealEasterEgg(event?: Event): void {
  const detail = event instanceof CustomEvent ? event.detail as { variant?: string } | undefined : undefined
  easterVariant.value = detail?.variant === 'reflection' ? 'reflection' : 'wedding'
  easterActive.value = false
  requestAnimationFrame(() => easterActive.value = true)
  if (easterTimer)
    clearTimeout(easterTimer)
  easterTimer = setTimeout(() => easterActive.value = false, 6200)
}

onMounted(() => window.addEventListener('gloria:easter-egg', revealEasterEgg))
onBeforeUnmount(() => {
  window.removeEventListener('gloria:easter-egg', revealEasterEgg)
  if (easterTimer)
    clearTimeout(easterTimer)
})
</script>

<template>
  <section class="gloria-stage" aria-label="SOS 团节点观测地图">
    <GloriaWorldMap :nodes="props.nodes" :paused="appStore.stopEarth" />
    <button type="button" data-gloria-easter-trigger="wedding" class="gloria-stage__egg" :class="{ 'is-light': !appStore.isDark }" title="召集 SOS 团" aria-label="召集 SOS 团" @click="revealEasterEgg">
      <SOSMark class="size-4" /><small>SOS</small>
    </button>

    <Teleport to="body">
      <Transition name="gloria-awakening">
        <button v-if="easterActive" type="button" class="gloria-easter" aria-label="关闭 SOS 团彩蛋" @click="easterActive = false">
          <video v-if="easterType === 'video'" class="gloria-easter__backdrop" :src="easterSource" poster="/images/sos/haruhi-bunny-mobile.webp" autoplay muted loop playsinline />
          <img v-else class="gloria-easter__backdrop" :src="easterSource" :alt="easterAlt">
          <span class="gloria-easter__veil" aria-hidden="true" />
          <span v-for="index in 18" :key="index" class="gloria-easter__star" :style="{ '--star-index': index }" aria-hidden="true">✦</span>
          <span class="gloria-easter__content">
            <span class="gloria-easter__crest">
              <SOSMark class="gloria-easter__gem" />
              <small>{{ appStore.easterEyebrow }}</small>
            </span>
            <strong :style="easterSloganStyle">{{ easterMessage }}</strong>
            <em>{{ appStore.easterSignature }}</em>
          </span>
        </button>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gloria-stage {
  position: relative;
  isolation: isolate;
  min-height: 16.5rem;
  overflow: hidden;
  border: 1px solid rgb(232 74 79 / 0.3);
  border-radius: 1.1rem;
  background: #07101f;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.06),
    0 18px 48px rgb(0 0 0 / 0.24);
}

:global(:root:not(.dark) .gloria-stage) {
  border-color: rgb(255 255 255 / 0.88);
  background: rgb(255 255 255 / 0.76);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.94),
    0 16px 40px rgb(143 23 35 / 0.16),
    0 5px 20px rgb(59 143 160 / 0.1);
}
.gloria-stage__egg {
  position: absolute;
  z-index: 6;
  top: 0.72rem;
  right: 0.78rem;
  display: grid;
  min-width: 4.25rem;
  place-items: center;
  border: 1px solid rgb(232 74 79 / 0.62);
  border-radius: 999px;
  background: rgb(7 16 31 / 0.78);
  padding: 0.32rem 0.52rem;
  color: #ffd24a;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 18px rgb(232 74 79 / 0.2);
  isolation: isolate;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    background 180ms ease;
}
.gloria-stage__egg::before {
  position: absolute;
  z-index: -1;
  inset: -0.18rem;
  border: 1px solid rgb(255 210 74 / 0.72);
  border-radius: inherit;
  content: '';
  pointer-events: none;
  animation: gloria-egg-signal 2.8s ease-out infinite;
}
.gloria-stage__egg::after {
  position: absolute;
  top: -0.2rem;
  right: 0.22rem;
  color: #ffd24a;
  content: '✦';
  font-size: 0.48rem;
  pointer-events: none;
  text-shadow:
    0 0 9px #f05b60,
    0 0 16px #ffd24a;
  animation: gloria-egg-spark 3.4s ease-in-out infinite;
}

.gloria-stage__egg.is-light {
  border-color: rgb(143 23 35 / 0.45);
  background: rgb(255 248 231 / 0.94);
  color: #b32632;
  box-shadow: 0 8px 22px rgb(143 23 35 / 0.16);
}

.gloria-stage__egg.is-light::before {
  border-color: rgb(143 23 35 / 0.38);
}

.gloria-stage__egg.is-light::after {
  color: #b32632;
  text-shadow: 0 0 8px rgb(143 23 35 / 0.35);
}

.gloria-stage__egg:hover {
  border-color: rgb(255 210 74 / 0.9);
  background: rgb(13 27 48 / 0.92);
  transform: translateY(-1px) scale(1.04);
}

.gloria-stage__egg.is-light:hover {
  border-color: rgb(143 23 35 / 0.72);
  background: #fff8e7;
  color: #b32632;
}
.gloria-stage__egg svg {
  color: #ffd24a;
  filter: drop-shadow(0 0 6px rgb(232 74 79 / 0.86));
  animation: gloria-egg-beacon 2.8s ease-in-out infinite;
}
.gloria-stage__egg.is-light svg {
  color: #b32632;
  filter: none;
}
.gloria-stage__egg small {
  margin-top: 0.14rem;
  font-family: var(--font-display);
  font-size: 0.4rem;
  letter-spacing: 0.08em;
}

.gloria-easter {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  overflow: hidden;
  place-items: center;
  border: 0;
  background: #040914;
  color: white;
  cursor: pointer;
}
.gloria-easter__backdrop,
.gloria-easter__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.gloria-easter__backdrop {
  object-fit: cover;
  object-position: center 42%;
  opacity: 0.43;
  animation: gloria-easter-camera 6.2s ease-out both;
}
.gloria-easter__veil {
  background:
    radial-gradient(circle at 50% 48%, transparent 4%, rgb(7 16 31 / 0.1) 38%, rgb(4 9 20 / 0.82) 100%),
    linear-gradient(0deg, rgb(4 9 20 / 0.8), transparent 44%, rgb(143 23 35 / 0.18));
}
.gloria-easter__content {
  --easter-tracking: 0.12em;
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
  justify-items: center;
  padding: clamp(1rem, 3.6vw, 2rem) clamp(1rem, 3.2vw, 1.6rem);
  text-align: center;
  text-shadow:
    0 3px 24px #040914,
    0 0 34px #040914;
}
.gloria-easter__crest {
  display: flex;
  align-items: center;
  align-self: end;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vw, 0.95rem);
  margin-bottom: clamp(0.7rem, 2.2vw, 1.35rem);
}
.gloria-easter__gem {
  width: clamp(4.5rem, 12vw, 8rem);
  height: clamp(4.5rem, 12vw, 8rem);
  color: #ffd24a;
  filter: drop-shadow(0 0 12px #ffd24a) drop-shadow(0 0 28px #f05b60);
  animation: gloria-gem-awaken 2.4s ease-in-out infinite;
}
.gloria-easter__content small {
  color: #71c5d1;
  font-family: var(--font-display);
  font-size: clamp(0.62rem, 1.5vw, 0.92rem);
  letter-spacing: 0.22em;
}
.gloria-easter__content strong {
  align-self: center;
  margin-right: calc(var(--easter-tracking) * -1);
  color: #fff7d6;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: var(--easter-tracking);
  line-height: 1.14;
  text-wrap: balance;
  text-shadow:
    0 4px 26px #040914,
    0 0 26px rgb(232 74 79 / 0.68),
    0 0 64px rgb(255 210 74 / 0.54);
}
.gloria-easter__content em {
  align-self: start;
  margin-top: clamp(0.5rem, 1.6vw, 0.85rem);
  color: rgb(255 210 74 / 0.94);
  font-family: var(--font-display);
  font-size: clamp(0.62rem, 1.7vw, 1rem);
  font-style: normal;
  letter-spacing: 0.32em;
}
.gloria-easter__star {
  --angle: calc(var(--star-index) * 20deg);
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  color: hsl(calc(4 + var(--star-index) * 3) 88% 68%);
  font-size: calc(0.45rem + var(--star-index) * 0.025rem);
  animation: gloria-star-burst 2.8s calc(var(--star-index) * -75ms) ease-out infinite;
}
.gloria-awakening-enter-active,
.gloria-awakening-leave-active {
  transition: opacity 380ms ease;
}
.gloria-awakening-enter-from,
.gloria-awakening-leave-to {
  opacity: 0;
}
@keyframes gloria-easter-camera {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1.11);
  }
}
@keyframes gloria-egg-beacon {
  0%,
  100% {
    transform: scale(0.92);
    filter: drop-shadow(0 0 6px rgb(232 74 79 / 0.56));
  }
  50% {
    transform: scale(1.13);
    filter: drop-shadow(0 0 10px #f05b60) drop-shadow(0 0 18px #ffd24a);
  }
}
@keyframes gloria-egg-signal {
  0% {
    opacity: 0.72;
    transform: scale(0.94);
  }
  72%,
  100% {
    opacity: 0;
    transform: scale(1.16, 1.34);
  }
}
@keyframes gloria-egg-spark {
  0%,
  34%,
  100% {
    opacity: 0.16;
    transform: translateY(1px) scale(0.72) rotate(0deg);
  }
  48% {
    opacity: 1;
    transform: translateY(-2px) scale(1.16) rotate(22deg);
  }
  62% {
    opacity: 0.34;
    transform: translateY(-4px) scale(0.84) rotate(42deg);
  }
}
@keyframes gloria-gem-awaken {
  0%,
  100% {
    transform: scale(0.9) rotate(-4deg);
    opacity: 0.78;
  }
  50% {
    transform: scale(1.08) rotate(4deg);
    opacity: 1;
  }
}
@keyframes gloria-star-burst {
  0% {
    transform: rotate(var(--angle)) translateX(1rem) scale(0);
    opacity: 0;
  }
  26% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(42vmin) scale(1.3);
    opacity: 0;
  }
}
@media (max-width: 767px) {
  .gloria-stage {
    min-height: 16.5rem;
  }
  .gloria-stage__egg {
    top: 0.62rem;
    right: 0.62rem;
  }
  .gloria-easter__backdrop {
    object-position: 78% 46%;
    opacity: 0.38;
  }
  .gloria-easter__content {
    --easter-tracking: 0.07em;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gloria-stage__egg::before,
  .gloria-stage__egg::after,
  .gloria-stage__egg svg,
  .gloria-easter__backdrop,
  .gloria-easter__gem,
  .gloria-easter__star {
    animation: none;
  }
}
</style>
