import { useState, useCallback } from "react";

const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: null,
  });

  const showAlert = useCallback((config) => {
    setAlertConfig({
      isOpen: true,
      type: "info",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      onConfirm: null,
      ...config,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const alert = useCallback(
    (message, title = "Alert", type = "info") => {
      showAlert({
        title,
        message,
        type,
      });
    },
    [showAlert],
  );

  const confirm = useCallback(
    (message, title = "Confirm", onConfirm) => {
      return new Promise((resolve) => {
        showAlert({
          title,
          message,
          type: "warning",
          showCancel: true,
          confirmText: "Yes",
          cancelText: "No",
          onConfirm: () => {
            onConfirm?.();
            resolve(true);
          },
        });
      });
    },
    [showAlert],
  );

  return {
    alertConfig,
    showAlert,
    hideAlert,
    alert,
    confirm,
  };
};

export default useAlert;
