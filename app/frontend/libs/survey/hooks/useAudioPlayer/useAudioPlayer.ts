import React, { useEffect, useRef } from 'react'

import PlayerSkins from './skins'
import { AudioPlayerSkin } from './interfaces'

export function useAudioPlayer (ref: React.MutableRefObject<HTMLElement>): void {
  const skins = useRef<AudioPlayerSkin[]>([])
  useEffect(() => {
    console.log(ref.current)
    const tags = ref.current.querySelectorAll('.fr-audio:not(.fr-audio-initialized)') as NodeListOf<HTMLElement>
    tags.forEach((tag) => {
      const audio = tag.querySelector('audio')
      if (!audio) return
      tag.removeAttribute('contenteditable')
      tag.removeAttribute('draggable')
      const { autoplay, skin } = tag.dataset
      tag.classList.add(`audio-skin-${skin}`)
      tag.classList.add('fr-audio-initialized')
      audio.removeAttribute('controls')
      if (autoplay) {
        audio.setAttribute('autoplay', 'autoplay')
      }
      if (skin && PlayerSkins[skin]) {
        PlayerSkins[skin].render(tag)
        skins.current.push(PlayerSkins[skin])
      }
    })
    return () => {
      skins.current.forEach(s => s.cleanup && s.cleanup())
      skins.current = []
    }
  }, [ref.current])
}
