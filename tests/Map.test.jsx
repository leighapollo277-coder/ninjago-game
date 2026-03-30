import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MapPrototype from '../MapPrototype';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => <div {...props} ref={ref}>{children}</div>),
    path: React.forwardRef(({ children, ...props }, ref) => <path {...props} ref={ref}>{children}</path>),
    img: React.forwardRef(({ children, ...props }, ref) => <img {...props} ref={ref}>{children}</img>),
    button: React.forwardRef(({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('MapPrototype', () => {
  it('renders Ninja Worlds title', () => {
    render(<MapPrototype />);
    expect(screen.getByText(/NINJA WORLDS/i)).toBeInTheDocument();
  });

  it('enters chapter map when a world is clicked', async () => {
    render(<MapPrototype />);
    const firstWorld = screen.getByText(/忍者啟程/i);
    fireEvent.click(firstWorld);
    
    await waitFor(() => {
      expect(screen.getByText(/BACK TO WORLDS/i)).toBeInTheDocument();
    });
  });

  it('renders correct number of level nodes', async () => {
    render(<MapPrototype />);
    const firstWorld = screen.getByText(/忍者啟程/i);
    fireEvent.click(firstWorld);
    
    await waitFor(() => {
        // Chapter 01 has 11 levels
        const nodes = screen.getAllByText(/第\d+關/i);
        expect(nodes.length).toBe(11);
    });
  });
});
