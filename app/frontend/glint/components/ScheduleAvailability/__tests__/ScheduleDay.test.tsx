import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { ScheduleDayTestWrapper } from './ScheduleDayTestWrapper'

test('Clicking on Add icon should show time timepickers', async () => {
  const user = userEvent.setup()
  render(
    <div id="container">
      <ScheduleDayTestWrapper
        label="Monday"
        day={1}
      />
    </div>,
  )
  const addTimePicker = screen.getByRole('button', { name: 'add' })

  await act(async () => {
    await user.click(addTimePicker)
  })
  const startTimePicker = screen.getByPlaceholderText('From')
  const endTimePicker = screen.getByPlaceholderText('To')
  expect(startTimePicker).toBeInTheDocument()
  expect(endTimePicker).toBeInTheDocument()
})

test('Remove button should be enabled initially and then disabled', async () => {
  const user = userEvent.setup()
  render(
    <div id="container">
      <ScheduleDayTestWrapper
        label="Monday"
        day={1}
      />
    </div>,
  )

  const addTimePicker = screen.getByRole('button', { name: 'add' })

  await act(async () => {
    await user.click(addTimePicker)
  })

  const secondAddTimePicker = screen.getByRole('button', { name: 'add' })

  await act(async () => {
    await user.click(secondAddTimePicker)
  })

  const allStartTimePickers = screen.getAllByPlaceholderText('From')
  expect(allStartTimePickers.length).toBe(2)

  const allEndTimePicker = screen.getAllByPlaceholderText('To')
  expect(allStartTimePickers.length).toBe(2)

  const allRemoveTimePicker = screen.getAllByRole('button', { name: 'remove' })
  expect(allRemoveTimePicker[0]).not.toBeDisabled()
  expect(allRemoveTimePicker[1]).not.toBeDisabled()

  await act(async () => {
    const firstRemoveTimePicker = allRemoveTimePicker[0]
    await user.click(firstRemoveTimePicker)
  })


  const removeTimePicker = screen.getByRole('button', { name: 'remove' })
  const startTimePickers = screen.getByPlaceholderText('From')
  const endTimePicker = screen.getByPlaceholderText('To')

    expect(removeTimePicker).toBeDisabled()
    expect(startTimePickers).toBeInTheDocument()
    expect(endTimePicker).toBeInTheDocument()


}, 30000)

describe('Add button should be ', () => {
  const user = userEvent.setup()

  test('disabled when both start and end times are not picked', async () => {
    render(
      <div id="container">
        <ScheduleDayTestWrapper
          label="Monday"
          day={1}
        />
      </div>,
    )

    let addTimePicker = screen.getByRole('button', { name: 'add' })

    await act(async () => {
      await user.click(addTimePicker)
    })

    const startTimePicker = screen.getByPlaceholderText(/to/i)
    const endTimePicker = screen.getByPlaceholderText(/from/i)

    // each picker owns its clear button, so resolve it from the picker root
    const clearButtonFor = (picker: HTMLElement) => {
      const clear = picker.closest('.ant-picker')?.querySelector<HTMLElement>('.ant-picker-clear')
      if (!clear) throw new Error('picker clear button not found')
      return clear
    }

    await act(async () => {
      await user.hover(startTimePicker).then(async () => {
        const close = clearButtonFor(startTimePicker)
        close.style['pointer-events'] = 'auto'
        await user.click(close)
      })
      await user.hover(endTimePicker).then(async () => {
        const close = clearButtonFor(endTimePicker)
        close.style['pointer-events'] = 'auto'
        await user.click(close)
      })
    })

    addTimePicker = screen.getByRole('button', { name: 'add' })
    expect(addTimePicker).toBeDisabled()
  }, 30000)

  // test('disabled when only start time is picked', async () => {
  //   render(
  //     <div id="container">
  //       <ScheduleDayTestWrapper
  //         label="Monday"
  //         day={1}
  //       />
  //     </div>,
  //   )
  //   let addTimePicker = screen.getByRole('button', { name: 'add' })
  //   await act(async () => {
  //     await user.click(addTimePicker)
  //   })
  //   addTimePicker = screen.getByRole('button', { name: 'add' })
  //   expect(addTimePicker).toBeDisabled()
  //
  //   const startTimePicker = screen.getByPlaceholderText('From')
  //   await act(async () => {
  //     await user.click(startTimePicker)
  //   })
  //
  //   const _1hour = screen.getByText('01')
  //   _1hour.style['pointer-events'] = 'auto'
  //   await act(async () => {
  //     await user.click(_1hour)
  //   })
  //
  //   const timePickerOkButton = screen.getByText('OK')
  //   timePickerOkButton.style['pointer-events'] = 'auto'
  //   await act(async () => {
  //     await user.click(timePickerOkButton)
  //   })
  //
  //   expect(screen.getByDisplayValue('1:00 AM')).toBeInTheDocument()
  //   expect(addTimePicker).toBeDisabled()
  // })
  //
  // test('disabled when only end time is picked', async () => {
  //   render(
  //     <div id="container">
  //       <ScheduleDayTestWrapper
  //         label="Monday"
  //         day={1}
  //       />
  //     </div>,
  //   )
  //   let addTimePicker = screen.getByRole('button', { name: 'add' })
  //   await act(async () => {
  //     await user.click(addTimePicker)
  //   })
  //   addTimePicker = screen.getByRole('button', { name: 'add' })
  //   const endTimePicker = screen.getByPlaceholderText('To')
  //
  //   await act(async () => {
  //     await user.click(endTimePicker)
  //   })
  //
  //   const _1hour = screen.getByText('01')
  //   _1hour.style['pointer-events'] = 'auto'
  //   await act(async () => {
  //     await user.click(_1hour)
  //   })
  //
  //   const timePickerOkButton = screen.getByText('OK')
  //   timePickerOkButton.style['pointer-events'] = 'auto'
  //   await act(async () => {
  //     await user.click(timePickerOkButton)
  //   })
  //
  //   expect(screen.getByDisplayValue('1:00 AM')).toBeInTheDocument()
  //   expect(addTimePicker).toBeDisabled()
  // })

  test('enabled when both start and end times are picked', async () => {
    render(
      <div id="container">
        <ScheduleDayTestWrapper
          label="Monday"
          day={1}
        />
      </div>,
    )
    let addTimePicker = screen.getByRole('button', { name: 'add' })
    await act(async () => {
      await user.click(addTimePicker)
    })
    addTimePicker = screen.getByRole('button', { name: 'add' })
    const startTimePicker = screen.getByPlaceholderText('From')
    const endTimePicker = screen.getByPlaceholderText('To')

    // Pick Start time as 01:00 AM
    await act(async () => {
      await user.click(startTimePicker)
    })

    const _1hour = screen.getByText('01')
    _1hour.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(_1hour)
    })

    let timePickerOkButton = screen.getByText('OK')
    timePickerOkButton.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(timePickerOkButton)
    })


    // Pick End time as 02:00 AM
    await act(async () => {
      await user.click(endTimePicker)
    })
    const _2hour = screen.getAllByText('02')[1]
    _2hour.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(_2hour)
    })

    timePickerOkButton = screen.getAllByText('OK')[1]
    timePickerOkButton.style['pointer-events'] = 'auto'
    await act(async () => {
      await user.click(timePickerOkButton)
    })

    expect(screen.getByDisplayValue('1:00 AM')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2:00 PM')).toBeInTheDocument()
    expect(addTimePicker).not.toBeDisabled()
  }, 30000)
})

test('Time lesser than start time should be disabled while selecting end time', async () => {
  const user = userEvent.setup()
  render(
    <div id="container">
      <ScheduleDayTestWrapper
        label="Monday"
        day={1}
      />
    </div>,
  )
  const addTimePicker = screen.getByRole('button', { name: 'add' })

  await act(async () => {
    await user.click(addTimePicker)
  })
  const startTimePicker = screen.getByPlaceholderText('From')
  expect(startTimePicker).toBeInTheDocument()
  const endTimePicker = screen.getByPlaceholderText('To')
  expect(endTimePicker).toBeInTheDocument()

  await act(async () => {
    await user.click(startTimePicker)
  })

  const _1hour = screen.getByText('01')
  const _15mins = screen.getByText('15')
  const startTimePickerOkButton = screen.getByText('OK')
  _1hour.style['pointer-events'] = 'auto'
  _15mins.style['pointer-events'] = 'auto'
  startTimePickerOkButton.style['pointer-events'] = 'auto'
  await act(async () => {
    await user.click(_1hour)
    await user.click(_15mins)
    await user.click(startTimePickerOkButton)
  })
  expect(screen.getByDisplayValue('1:15 AM')).toBeInTheDocument()


  await act(async () => {
    await user.click(endTimePicker)
  })
  const _1hourEndTime = screen.getAllByText('12')[1]
  const _15minsEndTime = screen.getAllByText('15')[1]
  _1hourEndTime.style['pointer-events'] = 'auto'
  _15minsEndTime.style['pointer-events'] = 'auto'
  const endTimePickerOkButton = screen.getAllByRole('button')[1]
  await act(async () => {
    await user.click(_1hourEndTime)
    await user.click(_15minsEndTime)
  })
  expect(screen.queryByDisplayValue('12:15 AM')).toBe(null)
  // expect(endTimePickerOkButton).not.toBeDisabled()
}, 30000)
