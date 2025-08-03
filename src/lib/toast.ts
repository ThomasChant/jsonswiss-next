import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, data?: any) => {
    return sonnerToast.success(message, data);
  },
  
  error: (message: string, data?: any) => {
    return sonnerToast.error(message, data);
  },
  
  info: (message: string, data?: any) => {
    return sonnerToast.info(message, data);
  },
  
  warning: (message: string, data?: any) => {
    return sonnerToast.warning(message, data);
  },
  
  loading: (message: string, data?: any) => {
    return sonnerToast.loading(message, data);
  },
  
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },
  
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  // Sidebar operation specific toast messages
  sidebar: {
    modeSwitch: {
      toNavigation: () => {
        return sonnerToast.success('Switched to navigation mode', {
          duration: 2000,
        });
      },
      toEditor: () => {
        return sonnerToast.success('Switched to editor mode', {
          duration: 2000,
        });
      },
    },

    fileImport: {
      success: (filename?: string) => {
        const message = filename 
          ? `File "${filename}" imported successfully`
          : 'File imported successfully';
        return sonnerToast.success(message, {
          duration: 3000,
        });
      },
      error: (error?: string) => {
        const message = error 
          ? `Failed to import file: ${error}`
          : 'Failed to import file';
        return sonnerToast.error(message, {
          duration: 4000,
        });
      },
      invalidFormat: () => {
        return sonnerToast.error('Invalid file format. Please select a JSON or text file', {
          duration: 4000,
        });
      },
    },

    jsonFormat: {
      success: () => {
        return sonnerToast.success('JSON formatted successfully', {
          duration: 2000,
        });
      },
      error: (error?: string) => {
        const message = error 
          ? `Failed to format JSON: ${error}`
          : 'Failed to format JSON';
        return sonnerToast.error(message, {
          duration: 4000,
        });
      },
    },

    clipboard: {
      copySuccess: () => {
        return sonnerToast.success('Copied to clipboard', {
          duration: 2000,
        });
      },
      copyError: () => {
        return sonnerToast.error('Failed to copy to clipboard', {
          duration: 3000,
        });
      },
    },

    validation: {
      invalidJson: (error?: string) => {
        const message = error 
          ? `Invalid JSON: ${error}`
          : 'Invalid JSON format';
        return sonnerToast.error(message, {
          duration: 4000,
        });
      },
      parseError: (line?: number, column?: number) => {
        let message = 'JSON parse error';
        if (line !== undefined && column !== undefined) {
          message += ` at line ${line}, column ${column}`;
        }
        return sonnerToast.error(message, {
          duration: 5000,
        });
      },
    },

    editor: {
      cleared: () => {
        return sonnerToast.info('Editor content cleared', {
          duration: 2000,
        });
      },
      contentUpdated: () => {
        return sonnerToast.success('Content updated successfully', {
          duration: 2000,
        });
      },
    },
  },
};
