import React, { useEffect } from 'react'

import PlayerSkins from './skins'

export function initAudioPlayer (el: HTMLElement): void {
  const tags = el.querySelectorAll('.fr-audio:not(.fr-audio-initialized)') as NodeListOf<HTMLElement>

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
    }
  })
}

export function useAudioPlayer (ref: React.MutableRefObject<null | HTMLElement>): void {
  useEffect(() => {
    if (!ref.current) return
    initAudioPlayer(ref.current)
  }, [ref.current])
}
