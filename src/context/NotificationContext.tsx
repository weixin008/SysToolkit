import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationType } from '../components/Common/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const showNotification = (type: NotificationType, message: string, duration = 3000) => {
    const id = nextId;
    setNextId(id + 1);
    
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};