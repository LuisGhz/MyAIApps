import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ChatApi } from '../../services/chat-api';
import { dispatch } from '@ngxs/store';
import { ChatActions } from '@st/chat/chat.actions';

const INITIAL_TIME = '00:00';
const MAX_RECORDING_TIME_MS = 60000;
const AUDIO_MIME_TYPE = 'audio/webm';
const TIMER_INTERVAL_MS = 1000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

@Component({
  selector: 'app-microphone',
  imports: [NzIconModule],
  templateUrl: './microphone.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Microphone implements OnDestroy {
  readonly #chatApi = inject(ChatApi);
  readonly #setMessageText = dispatch(ChatActions.SetMessageText);
  readonly #setIsTranscribing = dispatch(ChatActions.SetIsTranscribing);
  isRecording = signal(false);
  isTranscribing = signal(false);
  recordingTime = signal(INITIAL_TIME);
  #mediaRecorder: MediaRecorder | null = null;
  #chunks: Blob[] = [];
  #timerInterval: any;
  #startTime = 0;

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.#mediaRecorder = new MediaRecorder(stream);
      this.#chunks = [];

      this.#mediaRecorder.ondataavailable = (e) => {
        this.#chunks.push(e.data);
      };

      this.#mediaRecorder.onstop = async () => {
        const blob = new Blob(this.#chunks, { type: AUDIO_MIME_TYPE });
        this.isRecording.set(false);
        this.stopTimer();
        this.handleRecording(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      this.#mediaRecorder.start();
      this.isRecording.set(true);
      this.startTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }

  stopRecording() {
    if (this.#mediaRecorder && this.#mediaRecorder.state !== 'inactive') this.#mediaRecorder.stop();
  }

  startTimer() {
    this.#startTime = Date.now();
    this.recordingTime.set(INITIAL_TIME);
    this.#timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.#startTime;
      if (elapsed >= MAX_RECORDING_TIME_MS) {
        this.stopRecording();
        return;
      }
      const seconds = Math.floor(elapsed / MS_PER_SECOND);
      const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
      const remainingSeconds = seconds % SECONDS_PER_MINUTE;
      this.recordingTime.set(
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`,
      );
    }, TIMER_INTERVAL_MS);
  }

  stopTimer() {
    if (this.#timerInterval) {
      clearInterval(this.#timerInterval);
      this.#timerInterval = null;
    }
    this.recordingTime.set(INITIAL_TIME);
  }
  async handleRecording(blob: Blob) {
    this.isTranscribing.set(true);
    this.#setIsTranscribing(true);
    try {
      const file = new File([blob], 'recording.webm', { type: AUDIO_MIME_TYPE });
      const res = await this.#chatApi.transcribe(file);
      this.#setMessageText(res.text);
    } catch (error) {
      console.error('Transcription failed', error);
    } finally {
      this.isTranscribing.set(false);
      this.#setIsTranscribing(false);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.isRecording()) {
      this.stopRecording();
    }
  }
}
