import * as React from "react";
import {
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ToastTrigger,
} from "@fluentui/react-components";
import {
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  Warning24Regular,
  Info24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";

export enum ToastType {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

export interface ToastOptions {
  /**
   * Auto-dismiss timeout in milliseconds. Default is 4000ms for success/info, 6000ms for warning/error
   */
  timeout?: number;
  /**
   * Additional body text for the toast
   */
  body?: string;
  /**
   * Whether to prevent auto-dismiss. Default is false
   */
  persistent?: boolean;
}

// Global toaster ID to ensure all components use the same toaster
const GLOBAL_TOASTER_ID = "app-toaster";

/**
 * Custom hook for displaying toast notifications with consistent styling and behavior
 * Provides a unified API for showing success, error, warning, and info toasts
 *
 * @param toasterId - The toaster ID to use. If not provided, will use global toaster ID
 * @returns Object with showToast function and toasterId
 */
export const useToast = (toasterId?: string) => {
  const { t } = useTranslation(["common", "labels", "buttons"]);
  const actualToasterId = toasterId || GLOBAL_TOASTER_ID;
  const { dispatchToast } = useToastController(actualToasterId);

  const getToastIcon = (type: ToastType) => {
    const iconStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "20px",
      height: "20px",
    };

    switch (type) {
      case ToastType.Success:
        return React.createElement(CheckmarkCircle24Regular, { style: iconStyle });
      case ToastType.Error:
        return React.createElement(ErrorCircle24Regular, { style: iconStyle });
      case ToastType.Warning:
        return React.createElement(Warning24Regular, { style: iconStyle });
      case ToastType.Info:
        return React.createElement(Info24Regular, { style: iconStyle });
      default:
        return React.createElement(Info24Regular, { style: iconStyle });
    }
  };

  const getToastIntent = (type: ToastType) => {
    switch (type) {
      case ToastType.Success:
        return "success";
      case ToastType.Error:
        return "error";
      case ToastType.Warning:
        return "warning";
      case ToastType.Info:
        return "info";
      default:
        return "info";
    }
  };

  const getDefaultTimeout = (type: ToastType): number => {
    switch (type) {
      case ToastType.Success:
      case ToastType.Info:
        return 4000; // 4 seconds for positive feedback
      case ToastType.Warning:
      case ToastType.Error:
        return 6000; // 6 seconds for issues that need attention
      default:
        return 4000;
    }
  };

  /**
   * Show a toast notification
   *
   * @param type - The type of toast (success, error, warning, info)
   * @param message - The main message to display. Can be a translation key or plain text
   * @param options - Additional options for the toast
   */
  const showToast = React.useCallback(
    (type: ToastType, message: string, options: ToastOptions = {}) => {
      const { timeout, body, persistent = false } = options;

      // Try to translate the message, fallback to original if no translation exists
      let translatedMessage = message;
      try {
        const translated = t(message);
        // Use translation if it exists and is different from the key
        if (translated && translated !== message) {
          translatedMessage = translated;
        }
      } catch {
        // If translation fails, use original message
        translatedMessage = message;
      }

      // Try to translate body if provided
      let translatedBody = body;
      if (body) {
        try {
          const translated = t(body);
          if (translated && translated !== body) {
            translatedBody = translated;
          }
        } catch {
          translatedBody = body;
        }
      }

      const intent = getToastIntent(type);
      const autoTimeout = persistent ? undefined : timeout || getDefaultTimeout(type);

      // Create dismiss button using ToastTrigger
      const dismissButton = React.createElement(
        ToastTrigger,
        {},
        React.createElement(
          "button",
          {
            "aria-label": "Close",
            style: {
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "4px",
            },
          },
          React.createElement(Dismiss24Regular, {
            style: {
              width: "16px",
              height: "16px",
            },
          })
        )
      );

      // Create toast content following official Fluent UI pattern
      const toastContent = React.createElement(
        Toast,
        {},
        React.createElement(
          ToastTitle,
          {
            media: getToastIcon(type),
            action: dismissButton,
          },
          translatedMessage
        ),
        translatedBody && React.createElement(ToastBody, {}, translatedBody)
      );

      dispatchToast(toastContent, {
        intent: intent as any,
        timeout: autoTimeout,
      });
    },
    [dispatchToast, t, actualToasterId]
  );

  return {
    showToast,
    toasterId: actualToasterId,
  };
};

export default useToast;
