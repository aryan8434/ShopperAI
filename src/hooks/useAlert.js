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
    (messageOrConfig, title = "Confirm", onConfirm) => {
      return new Promise((resolve) => {
        let config = {};
        
        if (typeof messageOrConfig === "object" && messageOrConfig !== null) {
          config = messageOrConfig;
        } else {
          config = {
            message: messageOrConfig,
            title,
            onConfirm,
          };
        }

        showAlert({
          type: "warning",
          showCancel: true,
          confirmText: "Yes",
          cancelText: "No",
          ...config,
          onConfirm: () => {
            config.onConfirm?.();
            resolve(true);
          },
          onClose: () => {
             resolve(false); 
          }
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
