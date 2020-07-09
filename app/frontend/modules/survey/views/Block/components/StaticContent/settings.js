export const NORMAL_TOP = 'normalTop'
export const FIXED_TOP = 'fixedTop'
export const LEFT = 'left'
export const RIGHT = 'right'

export const STRETCH = '100% 100%'
export const REPEAT = 'repeat'
export const NO_REPEAT = 'no-repeat'
export const CONTAIN = 'contain'
export const COVER = 'cover'

export const HIGHLIGHT_COLORS = ['#6AD0D0', '#EDB780', '#FC83B6', '#98E581', '#E3DF7D']

export default {
  layouts: [
    { value: NORMAL_TOP, label: 'Top - Normal' },
    { value: FIXED_TOP, label: 'Top - Fixed Height' },
    { value: LEFT, label: 'Left' },
    { value: RIGHT, label: 'Right' },
  ],
  imageOptions: [
    { value: STRETCH, label: 'Stretch' },
    { value: REPEAT, label: 'Repeat' },
    { value: CONTAIN, label: 'Contain' },
    { value: COVER, label: 'Cover' },
  ],
}
