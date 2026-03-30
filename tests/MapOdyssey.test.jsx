import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MapCinematicEngine from '../MapCinematicEngine';

// Mock framer-motion for Odyssey features
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => <div {...props} ref={ref}>{children}</div>),
    h1: React.forwardRef(({ children, ...props }, ref) => <h1 {...props} ref={ref}>{children}</h1>),
    h2: React.forwardRef(({ children, ...props }, ref) => <h2 {...props} ref={ref}>{children}</h2>),
    img: React.forwardRef(({ children, ...props }, ref) => <img {...props} ref={ref}>{children}</img>),
    button: React.forwardRef(({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('MapCinematicEngine (Odyssey Platinum)', () => {
  it('renders Chapter 1: 大地秘境', () => {
    render(<MapCinematicEngine />);
    expect(screen.getByText(/CHAPTER 1/i)).toBeInTheDocument();
    expect(screen.getByText(/大地秘境/i)).toBeInTheDocument();
  });

  it('shows the Ninja Scroll with story content', () => {
    render(<MapCinematicEngine />);
    expect(screen.getByText(/NINJA SCROLL/i)).toBeInTheDocument();
    expect(screen.getByText(/Wu: 每一句話都是一塊石頭/i)).toBeInTheDocument();
  });

  it('opens and closes the Grand Dojo trophy room', async () => {
    render(<MapCinematicEngine />);
    const dojoBtn = screen.getByText(/DOJO ROOM/i);
    fireEvent.click(dojoBtn);
    expect(screen.getByText(/THE GRAND DOJO/i)).toBeInTheDocument();
    const backBtn = screen.getByText(/BACK TO WORLD/i);
    fireEvent.click(backBtn);
    await waitFor(() => {
        expect(screen.queryByText(/THE GRAND DOJO/i)).not.toBeInTheDocument();
    });
  });

  it('renders Boss Landmark at node 11', async () => {
     render(<MapCinematicEngine />);
     const nextBtn = screen.getByLabelText(/Next Mission/i);
     
     // Click forward to reach Level 11 (Boss)
     for(let i=0; i<10; i++) {
         fireEvent.click(nextBtn);
     }
     
     expect(screen.getByText(/BOSS BATTLE/i)).toBeInTheDocument();
     expect(screen.getByText(/第 11 關/i)).toBeInTheDocument();
  });
});
