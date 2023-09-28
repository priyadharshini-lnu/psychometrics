import React from 'react';
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { MaskedText } from '~/glint';

describe('MaskedText', () => {
  test('renders the masked text placeholder by default', () => {
    const { getByText } = render(<MaskedText text="Your sensitive information" />);
    const placeholderElement = getByText('************************************');
    expect(placeholderElement).toBeInTheDocument();
  });

  test('displays the original text when the view is enabled', async () => {
    render(<MaskedText text="Your sensitive information" />);
    let placeholderElement = screen.getByText('************************************');
    expect(placeholderElement).toBeInTheDocument();
    const toggleButton = screen.getByTestId(/masked-text-view/i);
    await userEvent.click(toggleButton);
    const originalTextElement = screen.getByText(/Your sensitive information/i);
    expect(originalTextElement).toBeInTheDocument();
  });

});
