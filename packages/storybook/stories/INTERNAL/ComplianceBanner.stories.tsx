// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Checkbox, IStackStyles, IStackTokens, Stack } from '@fluentui/react';
import { _ComplianceBanner as ComplianceBannerComponent } from '@internal/react-components';
import { _useCompositeLocale } from '@internal/react-composites';
import { Meta } from '@storybook/react/types-6-0';
import React, { useState } from 'react';

import { COMPONENT_FOLDER_PREFIX } from '../constants';
import { hiddenControl } from '../controlsUtils';

const ComplianceBannerStory = (): JSX.Element => {
  const strings = _useCompositeLocale().strings.call;
  const [callRecordState, setCallRecordState] = useState(true);
  const [callTranscribeState, setCallTranscribeState] = useState(true);
  return (
    <Stack styles={containerStyles} tokens={stackTokens}>
      <Stack horizontal tokens={stackTokens}>
        <Checkbox
          label="Recording is in progress"
          checked={callRecordState}
          onChange={(ev?: unknown, isChecked?: boolean) => setCallRecordState(!!isChecked)}
        />
        <Checkbox
          label="Transcription is in progress"
          checked={callTranscribeState}
          onChange={(ev?: unknown, isChecked?: boolean) => setCallTranscribeState(!!isChecked)}
        />
      </Stack>

      <ComplianceBannerComponent
        callRecordState={callRecordState}
        callTranscribeState={callTranscribeState}
        strings={strings}
      />
    </Stack>
  );
};

const containerStyles: IStackStyles = {
  root: {
    width: '80%',
    height: '80%'
  }
};

const stackTokens: IStackTokens = {
  childrenGap: '1rem'
};

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const ComplianceBanner = ComplianceBannerStory.bind({});

export default {
  id: `${COMPONENT_FOLDER_PREFIX}-internal-compliancebanner`,
  title: `${COMPONENT_FOLDER_PREFIX}/Internal/Compliance Banner`,
  component: ComplianceBannerComponent,
  argTypes: {
    // By default, all props of the primary component are added as controls.
    // We disable all of them because the story provides checkboxes to control the props.
    callRecordState: hiddenControl,
    callTranscribeState: hiddenControl,
    strings: hiddenControl
  }
} as Meta;
