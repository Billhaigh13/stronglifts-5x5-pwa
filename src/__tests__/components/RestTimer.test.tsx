import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RestTimer } from '../../components/RestTimer';

describe('RestTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when isActive is false', () => {
    const { container } = render(
      <RestTimer
        isActive={false}
        initialSeconds={90}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders timer countdown correctly when isActive is true', () => {
    render(
      <RestTimer
        isActive={true}
        initialSeconds={90}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('1:30')).toBeInTheDocument();
    expect(screen.getByText('Rest Timer')).toBeInTheDocument();
  });

  it('counts down each second', () => {
    render(
      <RestTimer
        isActive={true}
        initialSeconds={90}
        onClose={vi.fn()}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('1:28')).toBeInTheDocument();
  });

  it('adds +30s when add button is clicked', () => {
    render(
      <RestTimer
        isActive={true}
        initialSeconds={90}
        onClose={vi.fn()}
      />
    );

    const addBtn = screen.getByTitle('+30 Seconds');
    fireEvent.click(addBtn);

    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('pauses and resumes countdown', () => {
    render(
      <RestTimer
        isActive={true}
        initialSeconds={90}
        onClose={vi.fn()}
      />
    );

    const pauseBtn = screen.getByTitle('Pause');
    fireEvent.click(pauseBtn);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Time should remain paused at 1:30
    expect(screen.getByText('1:30')).toBeInTheDocument();

    const resumeBtn = screen.getByTitle('Resume');
    fireEvent.click(resumeBtn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('1:28')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <RestTimer
        isActive={true}
        initialSeconds={90}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByTitle('Close Timer');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
