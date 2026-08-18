import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackupModal } from '../../components/BackupModal';

describe('BackupModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BackupModal
        isOpen={false}
        onClose={vi.fn()}
        onDataRestored={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Backup modal with export/import tabs when open', async () => {
    render(
      <BackupModal
        isOpen={true}
        onClose={vi.fn()}
        onDataRestored={vi.fn()}
      />
    );

    expect(screen.getByText('Backup & Restore Data')).toBeInTheDocument();
    expect(screen.getByText('Export / Backup')).toBeInTheDocument();
    expect(screen.getByText('Import / Restore')).toBeInTheDocument();
    expect(screen.getByText('Save / Share File')).toBeInTheDocument();
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });

  it('switches to import tab and shows paste box & restore button', () => {
    render(
      <BackupModal
        isOpen={true}
        onClose={vi.fn()}
        onDataRestored={vi.fn()}
      />
    );

    const importTab = screen.getByText('Import / Restore');
    fireEvent.click(importTab);

    expect(screen.getByText('Option 1: Select .JSON Backup File')).toBeInTheDocument();
    expect(screen.getByText('Option 2: Paste Backup JSON Text')).toBeInTheDocument();
    expect(screen.getByText('Restore from Pasted Text')).toBeInTheDocument();
  });
});
