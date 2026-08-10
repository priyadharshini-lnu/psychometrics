import {
  render, within, fireEvent,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { ColorPicker } from '~/glint'

const sampleColor = {
  hex: 'DDFFFF',
  rgba: {
    r: 221, g: 255, b: 255, a: 1,
  },
}

const COLORS = ['#DDFFFF', '#FFFFFF', '#DDDDDD']
const REVERSED_COLORS = COLORS.slice().reverse()

test('it should return color in rgba format by default', async () => {
  const user = userEvent.setup()
  const handleChange = (color) => {
    expect(color).toEqual(sampleColor.rgba)
  }
  const { getByTestId } = render(
    <div id="container">
      <ColorPicker value="#CCFFDD" defaultColor="#CCFFDD" onChange={handleChange} />
    </div>,
  )
  const trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const input = getByTestId('color-input')
  input.style['pointer-events'] = 'auto'
  await act(async () => {
    await user.clear(input)
    await user.type(input, sampleColor.hex)
    await user.click(document.body)
  })
})

test('it should return color in hex format by when getValueInHexFormat prop is passed', async () => {
  const user = userEvent.setup()
  const handleChange = (color) => {
    expect(color).toBe(`#${sampleColor.hex}`)
  }

  const { getByTestId } = render(
    <div id="container">
      <ColorPicker value="#CCFFDD" getValueInHexFormat defaultColor="#CCFFDD" onChange={handleChange} />
    </div>,
  )

  const trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const input = getByTestId('color-input')
  input.style['pointer-events'] = 'auto'

  await act(async () => {
    await user.clear(input)
    await user.type(input, sampleColor.hex)
    await user.click(document.body)
  })
})

test('user should see previously selected colors in recently used color list', async () => {
  const user = userEvent.setup()

  const { getByTestId, getAllByTestId } = render(
    <div id="container">
      <ColorPicker getValueInHexFormat defaultColor="#CCFFDD" />
    </div>,
  )

  let trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const input = getByTestId('color-input')
  input.style['pointer-events'] = 'auto'

  await act(async () => {
    for (let index = 0; index < COLORS.length; index++) {
      const currentColor = COLORS[index]
      await user.clear(input)
      await user.type(input, currentColor)
      await user.click(document.body)
      trigger = getAllByTestId(`swatch-item-${currentColor}`)[0]
      trigger && fireEvent.click(trigger)
    }
    await user.click(document.body)
  })

  const recentlyUsedColorElements = getByTestId('recentlyUsedColors').querySelectorAll('button')
  recentlyUsedColorElements.forEach((recentlyUsedColorElement, index) => {
    expect(recentlyUsedColorElement.id).toBe(REVERSED_COLORS[index])
  })
  expect(localStorage.getItem('recentColors')).toBe(JSON.stringify(REVERSED_COLORS))
})

test('user should see recommended colors list when list of colors are passed through recommendedColors prop', async () => {
  const user = userEvent.setup()
  localStorage.setItem('recentColors', '')

  const { getByTestId } = render(
    <div id="container">
      <ColorPicker value="#CCFFDD" getValueInHexFormat recommendedColors={COLORS} defaultColor="#CCFFDD" />
    </div>,
  )

  const trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const recommendedColorElements = within(getByTestId('recommendedColors')).getAllByRole('button')
  recommendedColorElements.forEach((recentlyUsedColorElement, index) => {
    expect(recentlyUsedColorElement.id).toBe(COLORS[index])
  })
})

test('user should be able to select color present in recently used color list', async () => {
  const user = userEvent.setup()
  localStorage.setItem('recentColors', '')

  let latestPickedColor
  const handleChange = (color) => {
    latestPickedColor = color
  }

  const { getByTestId, getAllByTestId } = render(
    <div id="container">
      <ColorPicker getValueInHexFormat defaultColor="#CCFFDD" onChange={handleChange} />
    </div>,
  )

  let trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const input = getByTestId('color-input')
  input.style['pointer-events'] = 'auto'

  await act(async () => {
    for (let index = 0; index < COLORS.length; index++) {
      const currentColor = COLORS[index]
      await user.clear(input)
      await user.type(input, currentColor)
      await user.click(document.body)
      trigger = getAllByTestId(`swatch-item-${currentColor}`)[0]
      trigger && fireEvent.click(trigger)
    }
  })

  // Query outside act(): the recent-colours list only holds the loop's swatches once it has committed.
  const recentlyUsedColor = getByTestId(`swatch-item-${COLORS[1]}`)
  recentlyUsedColor.style['pointer-events'] = 'auto'
  await user.click(recentlyUsedColor)
  await user.click(document.body)

  expect(latestPickedColor).toBe(COLORS[1])
})

test('user should be able to select color present in recommended color list', async () => {
  const user = userEvent.setup()
  localStorage.setItem('recentColors', '')

  const handleChange = (color) => {
    expect(color).toBe(COLORS[1])
  }

  const { getByTestId } = render(
    <div id="container">
      <ColorPicker value="#CCFFDD" getValueInHexFormat recommendedColors={COLORS} defaultColor="#CCFFDD" onChange={handleChange} />
    </div>,
  )

  const trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const recommendedColor = getByTestId(`swatch-item-${COLORS[1]}`)
  recommendedColor.style['pointer-events'] = 'auto'

  // Separate act()s: closing the popover reports the picked colour, so the pick must commit first.
  await act(async () => {
    await user.click(recommendedColor)
  })
  await act(async () => {
    await user.click(document.body)
  })
})

test('user should not see duplicate colors in recently used color list when same color is selected multiple times', async () => {
  const user = userEvent.setup()
  localStorage.setItem('recentColors', '')

  const { getByTestId, getAllByTestId } = render(
    <div id="container">
      <ColorPicker getValueInHexFormat defaultColor="#CCFFDD" />
    </div>,
  )

  let trigger = getByTestId('swatch-item-#CCFFDD')
  trigger && fireEvent.click(trigger)
  const input = getByTestId('color-input')
  input.style['pointer-events'] = 'auto'

  await act(async () => {
    for (let index = 0; index < COLORS.length; index++) {
      const currentColor = COLORS[index]
      await user.clear(input)
      await user.type(input, currentColor)
      await user.click(document.body)
      trigger = getAllByTestId(`swatch-item-${currentColor}`)[0]
      trigger && fireEvent.click(trigger)
    }
  })

  // Query outside act(): the recent-colours list only holds the loop's swatches once it has committed.
  const recentlyUsedColor = getByTestId(`swatch-item-${COLORS[0]}`)
  recentlyUsedColor.style['pointer-events'] = 'auto'
  await user.click(recentlyUsedColor)
  await user.click(document.body)
  trigger = getAllByTestId(`swatch-item-${COLORS[0]}`)[0]
  trigger && fireEvent.click(trigger)

  const EXPECTED_REORDERED_COLORS = [COLORS[0], COLORS[2], COLORS[1]]
  const recentlyUsedColorElements = getByTestId('recentlyUsedColors').querySelectorAll('button')
  recentlyUsedColorElements.forEach((recentlyUsedColorElement, index) => {
    expect(recentlyUsedColorElement.id).toBe(EXPECTED_REORDERED_COLORS[index])
  })
  expect(localStorage.getItem('recentColors')).toBe(JSON.stringify(EXPECTED_REORDERED_COLORS))
})
