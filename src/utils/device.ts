/** Detects WebGL capability in the current environment. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Identifies low-power/mobile devices for 3D graphics adaptation. */
export const isLiteDevice = () =>
  typeof matchMedia === 'function' &&
  (matchMedia('(max-width: 768px)').matches || matchMedia('(pointer: coarse)').matches)

