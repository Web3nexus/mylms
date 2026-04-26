import { ConfirmDialog } from './ConfirmDialog';
import { ToastContainer } from './ToastContainer';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ConfirmDialog />
      <ToastContainer />
    </>
  );
};
