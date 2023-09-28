import { render, screen } from '@testing-library/react'

import { LightBackgroundButton } from '~/glint'

test('custom class passed through containerClass prop should be applied on text container', async () => {
  render(
    <div id="container">
      <LightBackgroundButton
       className='customClass'
      >Button</LightBackgroundButton>
    </div>,
  )

  const button = screen.getByRole('button')
  expect(button).toHaveClass('customClass')
})
