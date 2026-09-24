import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';

import { Microphone } from './microphone';
import { ChatStore } from '@st/chat/chat.store';
import { ChatApi } from '../../services/chat-api';

const mockChatApi = {
  transcribe: vi.fn().mockResolvedValue({ text: 'Transcribed text' }),
};

let mockMediaRecorderInstance: {
  start: Mock<() => void>;
  stop: Mock<() => void>;
  ondataavailable: ((e: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  state: string;
};

const mockMediaStream = {
  getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
};

class MockMediaRecorder {
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';
  startMock = vi.fn();
  stopMock = vi.fn();

  constructor() {
    mockMediaRecorderInstance = {
      start: this.startMock,
      stop: this.stopMock,
      ondataavailable: null,
      onstop: null,
      state: 'inactive',
    };
  }

  start() {
    this.state = 'recording';
    mockMediaRecorderInstance.state = 'recording';
    this.startMock();
  }

  stop() {
    this.state = 'inactive';
    mockMediaRecorderInstance.state = 'inactive';
    this.stopMock();
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

describe('Microphone', () => {
  let mediaStreamTracks: Array<{ stop: Mock }> = [];

  const renderComponent = async () => {
    const result = await render(Microphone, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([ChatStore]),
        { provide: ChatApi, useValue: mockChatApi },
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mediaStreamTracks = [{ stop: vi.fn() }];
    const mockMediaStreamLocal = {
      getTracks: vi.fn().mockReturnValue(mediaStreamTracks),
    };

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStreamLocal),
      },
      writable: true,
      configurable: true,
    });

    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
  });

  afterEach(async () => {
    // Stop any active media recorder
    if (mockMediaRecorderInstance && mockMediaRecorderInstance.state === 'recording') {
      mockMediaRecorderInstance.stop();
    }

    // Stop all media stream tracks
    mediaStreamTracks.forEach((track) => track.stop());

    // Flush all pending timers before switching back to real timers
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display record audio button by default', async () => {
    await renderComponent();

    expect(screen.getByRole('button', { name: 'Record audio' })).toBeInTheDocument();
  });

  it('should start recording when button is clicked', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));

    expect(fixture.componentInstance.isRecording()).toBe(true);
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeInTheDocument();
  });

  it('should display recording time while recording', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();

    expect(screen.getByText('00:02')).toBeInTheDocument();
  });

  it('should stop recording and transcribe audio when stop button is clicked', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    expect(fixture.componentInstance.isRecording()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Stop recording' }));

    await waitFor(() => {
      expect(fixture.componentInstance.isRecording()).toBe(false);
    });

    await waitFor(() => {
      expect(mockChatApi.transcribe).toHaveBeenCalled();
    });

    // Wait for transcription to complete
    await waitFor(() => {
      expect(fixture.componentInstance.isTranscribing()).toBe(false);
    });
  });

  it('should disable button while transcribing', async () => {
    const { fixture } = await renderComponent();

    fixture.componentInstance.isTranscribing.set(true);
    fixture.detectChanges();

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should handle transcription API failure gracefully', async () => {
    mockChatApi.transcribe.mockRejectedValue(new Error('Transcription failed'));
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    await user.click(screen.getByRole('button', { name: 'Stop recording' }));

    await waitFor(() => {
      expect(fixture.componentInstance.isTranscribing()).toBe(false);
    });

    expect(mockChatApi.transcribe).toHaveBeenCalled();
  });

  it('should handle microphone access denied', async () => {
    const getUserMediaMock = navigator.mediaDevices.getUserMedia as Mock;
    getUserMediaMock.mockRejectedValue(new Error('Permission denied'));

    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    await vi.waitFor(() => {
      expect(fixture.componentInstance.isRecording()).toBe(false);
    });

    expect(mockMediaRecorderInstance.start).not.toHaveBeenCalled();
  });

  it('should auto-stop recording after 60 seconds', async () => {
    mockChatApi.transcribe.mockResolvedValue({ text: 'Transcribed text' });
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    expect(fixture.componentInstance.isRecording()).toBe(true);

    vi.advanceTimersByTime(60000);
    fixture.detectChanges();

    await waitFor(() => {
      expect(fixture.componentInstance.isRecording()).toBe(false);
    });

    await waitFor(() => {
      expect(mockChatApi.transcribe).toHaveBeenCalled();
    });

    // Wait for transcription to complete
    await waitFor(() => {
      expect(fixture.componentInstance.isTranscribing()).toBe(false);
    });
  });

  it('should not fail when stopping inactive recorder', async () => {
    mockChatApi.transcribe.mockResolvedValue({ text: 'Transcribed text' });
    const { fixture } = await renderComponent();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: 'Record audio' }));
    await user.click(screen.getByRole('button', { name: 'Stop recording' }));

    await waitFor(() => {
      expect(fixture.componentInstance.isRecording()).toBe(false);
    });

    // Wait for transcription to complete
    await waitFor(() => {
      expect(fixture.componentInstance.isTranscribing()).toBe(false);
    });

    expect(() => fixture.componentInstance.stopRecording()).not.toThrow();
  });
});
