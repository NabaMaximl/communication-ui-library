// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { VideoStreamOptions } from '@internal/react-components';
import { AudioDeviceInfo, PermissionConstraints, VideoDeviceInfo, Call } from '@azure/communication-calling';
import { RemoteParticipantState } from '@internal/calling-stateful-client';
import { CallAdapterState, CallAdapter } from '../../../../../dist/dist-esm';
import { CallingState } from '../../CallingState';

export class MockCallAdapter implements CallAdapter {
  state: CallAdapterState;

  constructor(state: CallingState) {
    const remoteParticipants = {};
    for (const remoteParticipant of state.remoteParticipants) {
      const key = Math.random().toString();

      let view = undefined;
      if (remoteParticipant.isVideoStreamAvailable) {
        const mockVideoElement = document.createElement('div');
        mockVideoElement.innerHTML = '<span />';
        mockVideoElement.style.width = decodeURIComponent('100%25');
        mockVideoElement.style.height = decodeURIComponent('100%25');
        mockVideoElement.style.background = stringToHexColor(remoteParticipant.displayName);
        mockVideoElement.style.backgroundPosition = 'center';
        mockVideoElement.style.backgroundRepeat = 'no-repeat';
        view = { scalingMode: 'Crop', isMirrored: false, target: mockVideoElement };
      }

      remoteParticipants[key] = {
        identifier: { kind: 'unknown', id: key },
        state: 'Connected',
        videoStreams: {
          '1': {
            id: 1,
            mediaStreamType: 'Video',
            isAvailable: remoteParticipant.isVideoStreamAvailable,
            view
          }
        },
        isMuted: remoteParticipant.isMuted,
        isSpeaking: remoteParticipant.isSpeaking,
        displayName: remoteParticipant.displayName
      };
    }

    this.state = {
      displayName: 'Agnes Thompson',
      isLocalPreviewMicrophoneEnabled: true,
      page: 'call',
      call: {
        id: 'call1',
        callerInfo: { displayName: 'caller', identifier: { kind: 'unknown', id: '1' } },
        direction: 'Incoming',
        transcription: { isTranscriptionActive: false },
        recording: { isRecordingActive: false },
        startTime: new Date(500000000000),
        endTime: new Date(500000000000),
        diagnostics: { network: { latest: {} }, media: { latest: {} } },
        state: 'Connected',
        localVideoStreams: [],
        isMuted: false,
        isScreenSharingOn: false,
        remoteParticipants,
        remoteParticipantsEnded: {}
      },
      userId: { kind: 'unknown', id: '1' },
      devices: {
        isSpeakerSelectionAvailable: true,
        selectedCamera: { id: 'camera1', name: '1st Camera', deviceType: 'UsbCamera' },
        cameras: [{ id: 'camera1', name: '1st Camera', deviceType: 'UsbCamera' }],
        selectedMicrophone: {
          id: 'microphone1',
          name: '1st Microphone',
          deviceType: 'Microphone',
          isSystemDefault: true
        },
        microphones: [{ id: 'microphone1', name: '1st Microphone', deviceType: 'Microphone', isSystemDefault: true }],
        selectedSpeaker: { id: 'speaker1', name: 'First Speaker', deviceType: 'Speaker', isSystemDefault: true },
        speakers: [{ id: 'speaker1', name: 'First Speaker', deviceType: 'Speaker', isSystemDefault: true }],
        unparentedViews: [],
        deviceAccess: { video: true, audio: true }
      },
      isTeamsCall: false,
      latestErrors: {}
    };
  }

  addParticipant(participantKey: string, participantState: RemoteParticipantState): void {
    if (!this.state.call) {
      return;
    }
    this.state.call.remoteParticipants[participantKey] = participantState;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  onStateChange(handler: (state: any) => void): void {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  offStateChange(handler: (state: any) => void): void {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getState(): any {
    return this.state;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  dispose(): void {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  joinCall(microphoneOn?: boolean): Call | undefined {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async leaveCall(forEveryone?: boolean): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async startCamera(options?: VideoStreamOptions): Promise<void> {
    return;
  }
  async stopCamera(): Promise<void> {
    return;
  }
  async mute(): Promise<void> {
    return;
  }
  async unmute(): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startCall(participants: string[]): Call | undefined {
    return;
  }
  async startScreenShare(): Promise<void> {
    return;
  }
  async stopScreenShare(): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeParticipant(userId: string): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createStreamView(remoteUserId?: string, options?: VideoStreamOptions): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disposeStreamView(remoteUserId?: string, options?: VideoStreamOptions): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async askDevicePermission(constrain: PermissionConstraints): Promise<void> {
    return;
  }

  public async queryCameras(): Promise<VideoDeviceInfo[]> {
    return;
  }

  public async queryMicrophones(): Promise<AudioDeviceInfo[]> {
    return;
  }

  public async querySpeakers(): Promise<AudioDeviceInfo[]> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setCamera(sourceInfo: VideoDeviceInfo, options?: VideoStreamOptions): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setMicrophone(sourceInfo: AudioDeviceInfo): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setSpeaker(sourceInfo: AudioDeviceInfo): Promise<void> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  on(event: string): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  off(event: string): void {
    return;
  }
}

const stringToHexColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};