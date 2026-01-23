import React from 'react'
import {
  render, within, fireEvent, screen, waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Panel } from '~/glint'

test('it renders correctly', async () => {
  const props = {
    title: 'Title of Panel',
    description: 'Description of Panel',
    additionalDetails: [{ label: 'Time', value: '09:00 AM'}],
    children: 'Content of Panel',
  }
  const { container } = render(<Panel {...props} />)

  const headerElement = getHeaderElement(container)
  expect(headerElement?.textContent).toContain(props.title)
  expect(headerElement?.textContent).toContain(props.description)

  const additionalDetailsElement = getAdditionalElement(container)
  expect(additionalDetailsElement?.textContent).toContain(props.additionalDetails[0].label)
  expect(additionalDetailsElement?.textContent).toContain(props.additionalDetails[0].value)

  expect(container.textContent).toContain(props.children)
})

test("adds nonCollapsiblePanel class if Panel is not collapsible", async () => {
  const props = {
    title: 'Title of Panel',
    description: 'Description of Panel',
    additionalDetails: [{ label: 'Time', value: '09:00 AM'}],
    children: 'Content of Panel',
    collapsible: false,
  }
  const { container } = render(<Panel {...props} />)
  expect(container.querySelector('.ant-collapse-item')).toHaveClass('nonCollapsiblePanel')
})

test("doesn't add nonCollapsiblePanel class if Panel is not collapsible", async () => {
  const props = {
    title: 'Title of Panel',
    description: 'Description of Panel',
    additionalDetails: [{ label: 'Time', value: '09:00 AM'}],
    children: 'Content of Panel',
    collapsible: true,
  }
  const { container } = render(<Panel {...props} />)
  expect(container.querySelector('.ant-collapse-item')).not.toHaveClass('nonCollapsiblePanel')
})

const getHeaderElement = (container: HTMLElement): HTMLElement | null => {
  return container.querySelector('.ant-collapse-header')
}

const getAdditionalElement = (container: HTMLElement): HTMLElement | null => {
  return container.querySelector('.ant-collapse-extra')
}



