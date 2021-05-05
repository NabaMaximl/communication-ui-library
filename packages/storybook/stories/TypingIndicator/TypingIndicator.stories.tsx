// © Microsoft Corporation. All rights reserved.
import { object, text, boolean } from '@storybook/addon-knobs';
import { Meta } from '@storybook/react/types-6-0';
import { TypingIndicator as TypingIndicatorComponent } from 'react-components';
import React from 'react';
import { getDocs } from './TypingIndicatorDocs';
import { COMPONENT_FOLDER_PREFIX } from '../constants';

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const TypingIndicator: () => JSX.Element = () => {
  const typingUsers = object('Typing Users', [
    {
      userId: '1',
      displayName: 'User1'
    },
    {
      userId: '2',
      displayName: 'User2'
    }
  ]);
  const overrideTypingString = boolean('Override typing string?', false);
  const typingString = overrideTypingString ? text('Typing String', ' are typing away...') : undefined;
  return <TypingIndicatorComponent typingUsers={typingUsers} typingString={typingString} />;
};

export default {
  title: `${COMPONENT_FOLDER_PREFIX}/Typing Indicator`,
  component: TypingIndicatorComponent,
  parameters: {
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
