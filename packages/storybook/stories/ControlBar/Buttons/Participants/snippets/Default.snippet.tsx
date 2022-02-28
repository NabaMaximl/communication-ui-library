import { CallParticipantListParticipant, FluentThemeProvider, ParticipantsButton } from '@azure/communication-react';
import React from 'react';
import { defaultBorderStyles } from '../styles/ParticipantStyles';

const mockParticipants: CallParticipantListParticipant[] = [
  {
    userId: 'user1',
    displayName: 'You',
    state: 'Connected',
    isMuted: true,
    isScreenSharing: false,
    isRemovable: true
  },
  {
    userId: 'user2',
    displayName: 'Hal Jordan',
    state: 'Connected',
    isMuted: true,
    isScreenSharing: true,
    isRemovable: true
  },
  {
    userId: 'user3',
    displayName: 'Barry Allen',
    state: 'Idle',
    isMuted: false,
    isScreenSharing: false,
    isRemovable: true
  },
  {
    userId: 'user4',
    displayName: 'Bruce Wayne',
    state: 'Connecting',
    isMuted: false,
    isScreenSharing: false,
    isRemovable: false
  }
];

export const ParticipantsButtonDefaultExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <ParticipantsButton participants={mockParticipants} styles={defaultBorderStyles} />
    </FluentThemeProvider>
  );
};
