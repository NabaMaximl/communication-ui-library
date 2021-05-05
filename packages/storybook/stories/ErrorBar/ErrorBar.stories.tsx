// © Microsoft Corporation. All rights reserved.

import { Meta } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import { CommunicationUiErrorSeverity, ErrorBar as ErrorBarComponent } from 'react-components';
import { text, select } from '@storybook/addon-knobs';
import { getDocs } from './ErrorBarDocs';
import { COMPONENT_FOLDER_PREFIX } from '../constants';

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const ErrorBar = (): JSX.Element | null => {
  const [closed, setClosed] = useState<boolean>(false);
  const message = text('Message', 'This is a sample error message.');
  const severity = select<CommunicationUiErrorSeverity>(
    'Severity',
    CommunicationUiErrorSeverity,
    CommunicationUiErrorSeverity.ERROR
  );
  const onClearError = (): void => {
    setClosed(true);
  };

  if (!closed) {
    return <ErrorBarComponent message={message} severity={severity} onClose={onClearError} />;
  } else {
    return null;
  }
};

export default {
  title: `${COMPONENT_FOLDER_PREFIX}/Error Bar`,
  component: ErrorBarComponent,
  parameters: {
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
