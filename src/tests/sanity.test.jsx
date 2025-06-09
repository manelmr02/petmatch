import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

test('sanity test', () => {
  render(<h1>Funciona Testing</h1>);
  expect(screen.getByText('Funciona Testing')).toBeTruthy();
});
