import { render, waitFor } from '@testing-library/react'
import { FullWidthSkeleton } from '~/glint'

const ROW_COUNT = 4

test('should display correct number of skeleton rows', async () => {
  const { findByTestId } = render(
    <div data-testid="container">
      <FullWidthSkeleton rows={ROW_COUNT} />
    </div>,
  )
  const container = await findByTestId('container')
  const skeletonRowsDisplayed = await waitFor(() => container.querySelectorAll('.ant-skeleton.skeleton'))
  expect(skeletonRowsDisplayed.length).toBe(ROW_COUNT)
})

test('should display skeleton in single row when rows is passed as zero', async () => {
  const { findByTestId } = render(
    <div data-testid="container">
      <FullWidthSkeleton rows={0} />
    </div>,
  )
  const container = await findByTestId('container')
  const skeletonRowsDisplayed = await waitFor(() => container.querySelectorAll('.ant-skeleton.skeleton'))
  expect(skeletonRowsDisplayed.length).toBe(1)
})
