// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export * from './FileCard';
export * from './FileCardGroup';
export * from './FileDownloadHandler';
export * from './FileUpload';
export * from './FileUploadButton';
export * from './FileUploadHandler';
export * from './utils';

/**
 * Metadata used for setting uploaded files by a user using chat composite in a group call.
 * @internal
 */
export type FileSharingMetadata = {
  fileSharingMetadata: string;
};
