// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { concatStyleSets, Icon, ITextField, mergeStyles, Stack } from '@fluentui/react';
import { _formatString } from '@internal/acs-ui-common';
import { useTheme } from '../../theming/FluentThemeProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { editBoxStyle, inputBoxIcon, editingButtonStyle, editBoxStyleSet } from '../styles/EditBox.styles';
import { InputBoxButton, InputBoxComponent } from '../InputBoxComponent';
import { MessageThreadStrings } from '../MessageThread';
import { borderAndBoxShadowStyle } from '../styles/SendBox.styles';

const MAXIMUM_LENGTH_OF_MESSAGE = 8000;

const onRenderCancelIcon = (color: string): JSX.Element => {
  const className = mergeStyles(inputBoxIcon, { color });
  return <Icon iconName={'EditBoxCancel'} className={className} />;
};

const onRenderSubmitIcon = (color: string): JSX.Element => {
  const className = mergeStyles(inputBoxIcon, { color });
  return <Icon iconName={'EditBoxSubmit'} className={className} />;
};

/** @private */
export type ChatMessageComponentAsEditBoxProps = {
  onCancel?: () => void;
  onSubmit: (text: string) => void;
  initialValue: string;
  strings: MessageThreadStrings;
  /**
   * Inline the accept and reject edit buttons when editing a message.
   * Setting to false will mean they are on a new line inside the editable chat message.
   */
  inlineEditButtons: boolean;
};

type MessageState = 'OK' | 'too short' | 'too long';

/**
 * @private
 */
export const ChatMessageComponentAsEditBox = (props: ChatMessageComponentAsEditBoxProps): JSX.Element => {
  const { onCancel, onSubmit, initialValue, strings } = props;
  const [textValue, setTextValue] = useState<string>(initialValue);
  const editTextFieldRef = React.useRef<ITextField>(null);
  const theme = useTheme();
  const messageState = getMessageState(textValue);
  const submitEnabled = messageState === 'OK';

  useEffect(() => {
    editTextFieldRef.current?.focus();
  }, []);

  const setText = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ): void => {
    setTextValue(newValue ?? '');
  };

  const textTooLongMessage =
    messageState === 'too long'
      ? _formatString(strings.editBoxTextLimit, { limitNumber: `${MAXIMUM_LENGTH_OF_MESSAGE}` })
      : undefined;

  const onRenderThemedCancelIcon = useCallback(
    () => onRenderCancelIcon(theme.palette.neutralSecondary),
    [theme.palette.neutralSecondary]
  );

  const onRenderThemedSubmitIcon = useCallback(
    () => onRenderSubmitIcon(theme.palette.neutralSecondary),
    [theme.palette.neutralSecondary]
  );

  const editBoxStyles = useMemo(() => {
    return concatStyleSets(editBoxStyleSet, { textField: { borderColor: theme.palette.themePrimary } });
  }, [theme.palette.themePrimary]);

  return (
    <Stack
      className={mergeStyles(
        borderAndBoxShadowStyle({
          theme,
          hasErrorMessage: false,
          disabled: false
        })
      )}
    >
      <InputBoxComponent
        inlineChildren={props.inlineEditButtons}
        id={'editbox'}
        textFieldRef={editTextFieldRef}
        inputClassName={editBoxStyle(props.inlineEditButtons)}
        placeholderText={strings.editBoxPlaceholderText}
        textValue={textValue}
        onChange={setText}
        onEnterKeyDown={() => {
          submitEnabled && onSubmit(textValue);
        }}
        supportNewline={false}
        maxLength={MAXIMUM_LENGTH_OF_MESSAGE}
        errorMessage={textTooLongMessage}
        styles={editBoxStyles}
      >
        <InputBoxButton
          className={editingButtonStyle}
          ariaLabel={strings.editBoxCancelButton}
          tooltipContent={strings.editBoxCancelButton}
          onRenderIcon={onRenderThemedCancelIcon}
          onClick={() => {
            onCancel && onCancel();
          }}
          id={'dismissIconWrapper'}
        />
        <InputBoxButton
          className={editingButtonStyle}
          ariaLabel={strings.editBoxSubmitButton}
          tooltipContent={strings.editBoxSubmitButton}
          onRenderIcon={onRenderThemedSubmitIcon}
          onClick={(e) => {
            submitEnabled && onSubmit(textValue);
            e.stopPropagation();
          }}
          id={'submitIconWrapper'}
        />
      </InputBoxComponent>
    </Stack>
  );
};

const isMessageTooLong = (messageText: string): boolean => messageText.length > MAXIMUM_LENGTH_OF_MESSAGE;
const isMessageEmpty = (messageText: string): boolean => messageText.trim().length === 0;
const getMessageState = (messageText: string): MessageState =>
  isMessageEmpty(messageText) ? 'too short' : isMessageTooLong(messageText) ? 'too long' : 'OK';
