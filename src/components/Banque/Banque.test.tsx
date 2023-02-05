import React from 'react';
import { render, screen } from '@testing-library/react';
import Banque from './Banque';
import { BankDetails } from '../../models/BankModel';

test('renders total stake', () => {
  let bd: BankDetails = { totalStake: 50, bank: 100 };
  render(<Banque bank={bd.bank} totalStake={bd.totalStake} />);
  const stakeElmt = screen.getByText(/50/i);
  expect(stakeElmt).toBeInTheDocument();
});

test('renders bank', () => {
  let bd: BankDetails = { totalStake: 50, bank: 100 };
  render(<Banque bank={bd.bank} totalStake={bd.totalStake} />);
  const bankElmt = screen.getByText(/100/i);
  expect(bankElmt).toBeInTheDocument();
});
