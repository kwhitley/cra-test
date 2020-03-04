import { h } from 'preact'
import { lazy as preactLazy } from 'preact/compat'

export const lazy = (componentImportFn) => preactLazy(async () => {
  let obj = await componentImportFn()
  return typeof obj.default === 'function' ? obj : obj.default
})