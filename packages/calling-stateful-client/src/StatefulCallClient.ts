// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { deviceManagerDeclaratify } from './DeviceManagerDeclarative';
import {
  CallAgent,
  CallClient,
  CallClientOptions,
  CreateViewOptions,
  DeviceManager
} from '@azure/communication-calling';
import { CallClientState, LocalVideoStreamState, RemoteVideoStreamState } from './CallClientState';
import { CallContext } from './CallContext';
import { callAgentDeclaratify } from './CallAgentDeclarative';
import { InternalCallContext } from './InternalCallContext';
import { createView, disposeView, CreateViewResult } from './StreamUtils';
import { CommunicationIdentifier, CommunicationUserIdentifier, getIdentifierKind } from '@azure/communication-common';
import { _getApplicationId } from '@internal/acs-ui-common';
import { callingStatefulLogger } from './Logger';

/**
 * Defines the methods that allow CallClient {@link @azure/communication-calling#CallClient} to be used statefully.
 * The interface provides access to proxied state and also allows registering a handler for state change events. For
 * state definition see {@link CallClientState}.
 *
 * State change events are driven by:
 * - Returned data from {@link @azure/communication-calling#DeviceManager} APIs.
 * - Returned data from {@link @azure/communication-calling#CallAgent} APIs.
 * - Listeners automatically attached to various azure communication-calling objects:
 *   - CallAgent 'incomingCall'
 *   - CallAgent 'callsUpdated'
 *   - DeviceManager 'videoDevicesUpdated'
 *   - DeviceManager 'audioDevicesUpdated
 *   - DeviceManager 'selectedMicrophoneChanged'
 *   - DeviceManager 'selectedSpeakerChanged'
 *   - Call 'stateChanged'
 *   - Call 'idChanged'
 *   - Call 'isMutedChanged'
 *   - Call 'isScreenSharingOnChanged'
 *   - Call 'remoteParticipantsUpdated'
 *   - Call 'localVideoStreamsUpdated'
 *   - IncomingCall 'callEnded'
 *   - RemoteParticipant 'stateChanged'
 *   - RemoteParticipant 'isMutedChanged'
 *   - RemoteParticipant 'displayNameChanged'
 *   - RemoteParticipant 'isSpeakingChanged'
 *   - RemoteParticipant 'videoStreamsUpdated'
 *   - RemoteVideoStream 'isAvailableChanged'
 *   - TranscriptionCallFeature 'isTranscriptionActiveChanged'
 *   - RecordingCallFeature 'isRecordingActiveChanged'
 *
 * @public
 */
export interface StatefulCallClient extends CallClient {
  /**
   * Holds all the state that we could proxy from CallClient {@link @azure/communication-calling#CallClient} as
   * CallClientState {@link CallClientState}.
   */
  getState(): CallClientState;
  /**
   * Allows a handler to be registered for 'stateChanged' events.
   *
   * @param handler - Callback to receive the state.
   */
  onStateChange(handler: (state: CallClientState) => void): void;
  /**
   * Allows unregistering for 'stateChanged' events.
   *
   * @param handler - Original callback to be unsubscribed.
   */
  offStateChange(handler: (state: CallClientState) => void): void;
  /**
   * Renders a {@link RemoteVideoStreamState} or {@link LocalVideoStreamState} and stores the resulting
   * {@link VideoStreamRendererViewState} under the relevant {@link RemoteVideoStreamState} or
   * {@link LocalVideoStreamState} or as unparented view in the state. Under the hood calls
   * {@link @azure/communication-calling#VideoStreamRenderer.createView}.
   *
   * Scenario 1: Render RemoteVideoStreamState
   * - CallId is required, participantId is required, and stream of type RemoteVideoStreamState is required
   * - Resulting {@link VideoStreamRendererViewState} is stored in the given callId and participantId in
   * {@link CallClientState}
   *
   * Scenario 2: Render LocalVideoStreamState for a call
   * - CallId is required, participantId must be undefined, and stream of type LocalVideoStreamState is required.
   * - The {@link @azure/communication-calling#Call.localVideoStreams} must already be started using
   *   {@link @azure/communication-calling#Call.startVideo}.
   * - Resulting {@link VideoStreamRendererViewState} is stored in the given callId {@link CallState.localVideoStreams}
   *   in {@link CallClientState}.
   *
   * - Scenario 2: Render LocalVideoStreamState not part of a call (example rendering camera for local preview)
   * - CallId must be undefined, participantId must be undefined, and stream of type LocalVideoStreamState is required.
   * - Resulting {@link VideoStreamRendererViewState} is stored in under the given LocalVideoStreamState in
   *   {@link CallClientState.deviceManager.unparentedViews}
   *
   * @param callId - CallId for the given stream. Can be undefined if the stream is not part of any call.
   * @param participantId - {@link RemoteParticipant.identifier} associated with the given RemoteVideoStreamState. Could
   *   be undefined if rendering LocalVideoStreamState.
   * @param stream - The LocalVideoStreamState or RemoteVideoStreamState to start rendering.
   * @param options - Options that are passed to the {@link @azure/communication-calling#VideoStreamRenderer}.
   */
  createView(
    callId: string | undefined,
    participantId: CommunicationIdentifier | undefined,
    stream: LocalVideoStreamState | RemoteVideoStreamState,
    options?: CreateViewOptions
  ): Promise<CreateViewResult | undefined>;
  /**
   * Stops rendering a {@link RemoteVideoStreamState} or {@link LocalVideoStreamState} and removes the
   * {@link VideoStreamRendererView} from the relevant {@link RemoteVideoStreamState} in {@link CallClientState} or
   * {@link LocalVideoStream} in {@link CallClientState} or appropriate
   * {@link CallClientState.deviceManager.unparentedViews} Under the hood calls
   * {@link @azure/communication-calling#VideoStreamRenderer.dispose}.
   *
   * Its important to disposeView to clean up resources properly.
   *
   * Scenario 1: Dispose RemoteVideoStreamState
   * - CallId is required, participantId is required, and stream of type RemoteVideoStreamState is required
   *
   * Scenario 2: Dispose LocalVideoStreamState for a call
   * - CallId is required, participantId must be undefined, and stream of type LocalVideoStreamState is required.
   *
   * - Scenario 2: Dispose LocalVideoStreamState not part of a call
   * - CallId must be undefined, participantId must be undefined, and stream of type LocalVideoStreamState is required.
   * - LocalVideoStreamState must be the original one passed to createView.
   *
   * @param callId - CallId for the given stream. Can be undefined if the stream is not part of any call.
   * @param participantId - {@link RemoteParticipant.identifier} associated with the given RemoteVideoStreamState. Could
   *   be undefined if disposing LocalVideoStreamState.
   * @param stream - The LocalVideoStreamState or RemoteVideoStreamState to dispose.
   */
  disposeView(
    callId: string | undefined,
    participantId: CommunicationIdentifier | undefined,
    stream: LocalVideoStreamState | RemoteVideoStreamState
  ): void;
}

/**
 * A function to modify the state of the StatefulCallClient.
 *
 * Provided as a callback to the {@link StatefulCallClient.modifyState} method.
 *
 * The function must modify the provided state in place as much as possible.
 * Making large modifications can lead to bad performance by causing spurious rerendering of the UI.
 *
 * Consider using commonly used modifier functions exported from this package.
 */
export type CallStateModifier = (state: CallClientState) => void;

/**
 * ProxyCallClient proxies CallClient {@link @azure/communication-calling#CallClient} and subscribes to all events that
 * affect state. ProxyCallClient keeps its own copy of the call state and when state is updated, ProxyCallClient emits
 * the event 'stateChanged'.
 */
class ProxyCallClient implements ProxyHandler<CallClient> {
  private _context: CallContext;
  private _internalContext: InternalCallContext;
  private _callAgent: CallAgent | undefined;
  private _deviceManager: DeviceManager | undefined;
  private _sdkDeviceManager: DeviceManager | undefined;

  constructor(context: CallContext, internalContext: InternalCallContext) {
    this._context = context;
    this._internalContext = internalContext;
  }

  public get<P extends keyof CallClient>(target: CallClient, prop: P): any {
    switch (prop) {
      case 'createCallAgent': {
        return this._context.withAsyncErrorTeedToState(async (...args: Parameters<CallClient['createCallAgent']>) => {
          // createCallAgent will throw an exception if the previous callAgent was not disposed. If the previous
          // callAgent was disposed then it would have unsubscribed to events so we can just create a new declarative
          // callAgent if the createCallAgent succeeds.
          const callAgent = await target.createCallAgent(...args);
          this._callAgent = callAgentDeclaratify(callAgent, this._context, this._internalContext);
          this._context.setCallAgent({ displayName: this._callAgent.displayName });
          return this._callAgent;
        }, 'CallClient.createCallAgent');
      }
      case 'getDeviceManager': {
        return this._context.withAsyncErrorTeedToState(async () => {
          // As of writing, the SDK always returns the same instance of DeviceManager so we keep a reference of
          // DeviceManager and if it does not change we return the cached DeclarativeDeviceManager. If it does not we'll
          // throw an error that indicate we need to fix this issue as our implementation has diverged from the SDK.
          const deviceManager = await target.getDeviceManager();
          if (this._sdkDeviceManager) {
            if (this._sdkDeviceManager === deviceManager) {
              return this._deviceManager;
            } else {
              throw new Error(
                'Multiple DeviceManager not supported. This means a incompatible version of communication-calling is ' +
                  'used OR calling declarative was not properly updated to communication-calling version.'
              );
            }
          } else {
            this._sdkDeviceManager = deviceManager;
          }
          this._deviceManager = deviceManagerDeclaratify(deviceManager, this._context);
          return this._deviceManager;
        }, 'CallClient.getDeviceManager');
      }
      default:
        return Reflect.get(target, prop);
    }
  }
}

/**
 * Arguments to construct the StatefulCallClient.
 *
 * @public
 */
export type StatefulCallClientArgs = {
  /**
   * UserId from SDK. This is provided for developer convenience to easily access the userId from the
   * state. It is not used by StatefulCallClient.
   */
  userId: CommunicationUserIdentifier;
};

/**
 * Options to construct the StatefulCallClient with.
 *
 * @public
 */
export type StatefulCallClientOptions = {
  /**
   * Options to construct the {@link @axure/communication-calling#CallClient} with.
   */
  callClientOptions: CallClientOptions;
  /**
   * Sets the max listeners limit of the 'stateChange' event. Defaults to the node.js EventEmitter.defaultMaxListeners
   * if not specified.
   */
  maxStateChangeListeners?: number;
};

/**
 * Creates a StatefulCallClient {@link StatefulCallClient} by proxying CallClient
 * {@link @azure/communication-calling#CallClient} with ProxyCallClient {@link ProxyCallClient} which then allows access
 * to state in a declarative way.
 *
 * It is important to use the {@link @azure/communication-calling#DeviceManager} and
 * {@link @azure/communication-calling#CallAgent} and {@link @azure/communication-calling#Call} (and etc.) that are
 * obtained from the StatefulCallClient in order for their state changes to be proxied properly.
 *
 * @param args - {@link StatefulCallClientArgs}
 * @param options - {@link StatefulCallClientOptions}
 *
 * @public
 */
export const createStatefulCallClient = (
  args: StatefulCallClientArgs,
  options?: StatefulCallClientOptions
): StatefulCallClient => {
  callingStatefulLogger.info(`Creating calling stateful client using library version: ${_getApplicationId()}`);
  return createStatefulCallClientWithDeps(
    new CallClient(withTelemetryTag(options?.callClientOptions)),
    new CallContext(getIdentifierKind(args.userId), options?.maxStateChangeListeners),
    new InternalCallContext()
  );
};

/**
 * Package-internal version of createStatefulCallClient that allows dependency injection.
 *
 * This function should not be exported from the package.
 */
export const createStatefulCallClientWithDeps = (
  callClient: CallClient,
  context: CallContext,
  internalContext: InternalCallContext
): StatefulCallClient => {
  Object.defineProperty(callClient, 'getState', {
    configurable: false,
    value: () => context.getState()
  });
  Object.defineProperty(callClient, 'onStateChange', {
    configurable: false,
    value: (handler: (state: CallClientState) => void) => context.onStateChange(handler)
  });
  Object.defineProperty(callClient, 'offStateChange', {
    configurable: false,
    value: (handler: (state: CallClientState) => void) => context.offStateChange(handler)
  });
  Object.defineProperty(callClient, 'createView', {
    configurable: false,
    value: (
      callId: string | undefined,
      participantId: CommunicationIdentifier | undefined,
      stream: LocalVideoStreamState | RemoteVideoStreamState,
      options?: CreateViewOptions
    ): Promise<CreateViewResult | undefined> => {
      const participantIdKind = participantId ? getIdentifierKind(participantId) : undefined;
      return createView(context, internalContext, callId, participantIdKind, stream, options);
    }
  });
  Object.defineProperty(callClient, 'disposeView', {
    configurable: false,
    value: (
      callId: string | undefined,
      participantId: CommunicationIdentifier | undefined,
      stream: LocalVideoStreamState | RemoteVideoStreamState
    ): void => {
      const participantIdKind = participantId ? getIdentifierKind(participantId) : undefined;
      disposeView(context, internalContext, callId, participantIdKind, stream);
    }
  });

  return new Proxy(callClient, new ProxyCallClient(context, internalContext)) as StatefulCallClient;
};

const withTelemetryTag = (options?: CallClientOptions): CallClientOptions => {
  const tags = options?.diagnostics?.tags ?? [];
  tags.push(_getApplicationId());
  return {
    ...options,
    diagnostics: {
      ...options?.diagnostics,
      tags
    }
  };
};
