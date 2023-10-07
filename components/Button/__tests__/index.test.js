import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'

import Component from '../index'; // Adjust the import path accordingly

test('Component renders with given props', () => {
  const onClickMock = jest.fn();

  const { getByTestId } = render(
    <Component
      className="custom-class"
      data-testid="custom-button"
      onClick={onClickMock}
    >
      Click Me
    </Component>
  );

  const buttonElement = getByTestId('custom-button');

  // Ensure the button has the correct class
  expect(buttonElement).toHaveClass('btn custom-class');

  // Ensure the button has the correct text content
  expect(buttonElement).toHaveTextContent('Click Me');

  // Simulate a button click
  fireEvent.click(buttonElement);

  // Ensure the onClick function is called when the button is clicked
  expect(onClickMock).toHaveBeenCalledTimes(1);
});

test('Component renders with default class if no className provided', () => {
  const { getByTestId } = render(
    <Component data-testid="default-button">
      Click Me
    </Component>
  );

  const buttonElement = getByTestId('default-button');

  // Ensure the button has the default class
  expect(buttonElement).toHaveClass('btn');

  // Ensure the button has the correct text content
  expect(buttonElement).toHaveTextContent('Click Me');
});
