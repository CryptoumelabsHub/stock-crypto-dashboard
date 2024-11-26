import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddAssetForm from '../AddAssetForm';
import { AssetType } from '../../../types/asset';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AddAssetForm', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<AddAssetForm onSuccess={mockOnClose} />);

    // Check if all form fields are present
    expect(screen.getByLabelText(/asset type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/buy price/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AddAssetForm onSuccess={mockOnClose} />);
    
    // Try to submit without filling any fields
    const submitButton = screen.getByRole('button', { name: /add asset/i });
    await userEvent.click(submitButton);

    // Check browser validation messages
    const symbolInput = screen.getByLabelText(/symbol/i) as HTMLInputElement;
    const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement;
    const buyPriceInput = screen.getByLabelText(/buy price/i) as HTMLInputElement;

    expect(symbolInput.validity.valid).toBe(false);
    expect(quantityInput.validity.valid).toBe(false);
    expect(buyPriceInput.validity.valid).toBe(false);
  });

  it('handles form submission correctly', async () => {
    const mockFetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Asset added successfully' }),
      })
    );
    global.fetch = mockFetch;

    render(<AddAssetForm onSuccess={mockOnClose} />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');
    await userEvent.type(screen.getByLabelText(/quantity/i), '10');
    await userEvent.type(screen.getByLabelText(/buy price/i), '150.50');
    await userEvent.selectOptions(screen.getByLabelText(/asset type/i), AssetType.STOCK);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add asset/i });
    await userEvent.click(submitButton);

    // Check if the API was called with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        type: AssetType.STOCK,
        quantity: 10,
        buyPrice: 150.50,
      }),
    });

    // Check if success toast was shown
    await waitFor(() => {
      expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith('Asset added successfully');
    });

    // Check if onSuccess was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles API errors correctly', async () => {
    const mockFetch = jest.fn(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to add asset' }),
      })
    );
    global.fetch = mockFetch;

    render(<AddAssetForm onSuccess={mockOnClose} />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/symbol/i), 'INVALID');
    await userEvent.type(screen.getByLabelText(/quantity/i), '10');
    await userEvent.type(screen.getByLabelText(/buy price/i), '150.50');
    await userEvent.selectOptions(screen.getByLabelText(/asset type/i), AssetType.STOCK);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add asset/i });
    await userEvent.click(submitButton);

    // Check if error toast was shown
    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith('Failed to add asset');
    });

    // Check if onSuccess was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
