import type { Plugin } from 'vite'

const VIRTUAL_ID = '\0videojs-record-wrapper'
const REAL_IMPORT = 'videojs-record/dist/videojs.record.js'

/**
 * Vite 8/Rolldown's CJS interop double-wraps video.js exports when
 * videojs-record's UMD bundle uses require("videojs"). This plugin
 * intercepts the import and sets up window globals so the UMD's
 * global fallback branch is used instead.
 */
export default function videojsRecordCompat(): Plugin {
  let resolvedPath = ''

  return {
    name: 'videojs-record-compat',
    enforce: 'pre',
    apply: 'serve',

    async resolveId(id, importer) {
      if (id === 'videojs-record/dist/videojs.record') {
        if (!resolvedPath) {
          const resolved = await this.resolve(REAL_IMPORT, importer, { skipSelf: true })
          resolvedPath = resolved?.id || ''
        }
        return VIRTUAL_ID
      }
    },

    load(id) {
      if (id !== VIRTUAL_ID) return null

      return `
        import videojs from 'video.js';
        import RecordRTC from 'recordrtc';
        window.videojs = videojs;
        window.RecordRTC = RecordRTC;
        await import(/* @vite-ignore */ '${resolvedPath}');
      `
    },
  }
}
