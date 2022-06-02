// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import ReactDOM from 'react-dom';
import { AzureCommunicationTokenCredential, CommunicationTokenRefreshOptions } from '@azure/communication-common';
import {
  ChatComposite,
  createAzureCommunicationChatAdapter,
  COMPOSITE_LOCALE_EN_US,
  COMPOSITE_LOCALE_EN_GB,
  COMPOSITE_LOCALE_ES_ES,
  COMPOSITE_LOCALE_IT_IT,
  COMPOSITE_LOCALE_PT_BR
} from '@azure/communication-react';

export const loadChatComposite = async function (args, htmlElement, props) {
  const { userId, token, endpoint, threadId, displayName, tokenRefresher, locale, context } = args;
  const options = {
    token: token,
    tokenRefresher: tokenRefresher,
    refreshProactively: false
  };
  const localMap = {
    en: COMPOSITE_LOCALE_EN_US,
    es: COMPOSITE_LOCALE_ES_ES,
    pt: COMPOSITE_LOCALE_PT_BR,
    it: COMPOSITE_LOCALE_IT_IT
  };
  const adapter = await createAzureCommunicationChatAdapter({
    endpoint,
    userId,
    displayName: displayName ?? 'anonymous',
    credential: new AzureCommunicationTokenCredential(options),
    threadId
  });
  ReactDOM.render(
    React.createElement(
      ChatComposite,
      { ...props, adapter, locale: localMap[locale], context: context ? context : undefined },
      null
    ),
    htmlElement
  );
  return adapter;
};
