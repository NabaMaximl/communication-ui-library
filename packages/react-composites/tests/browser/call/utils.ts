// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { encodeQueryData } from '../common/utils';
import { CallingState } from './CallingState';

/**
 * Create the test URL.
 * @param serverUrl - URL of webpage to test, this is typically https://localhost:3000
 * @param user - Test user the props of which populate query search parameters
 * @param state - State
 * @param qArgs - Optional args to add to the query search parameters of the URL.
 * @returns URL string
 */
export const buildCallingUrl = (serverUrl: string, state: CallingState, qArgs?: { [key: string]: string }): string => {
  console.log('state: ', JSON.stringify(state));
  return `${serverUrl}?${encodeQueryData({ state: JSON.stringify(state), ...qArgs })}`;
};