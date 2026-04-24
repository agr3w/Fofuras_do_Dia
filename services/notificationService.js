import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração de como a notificação se comporta se o app estiver aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissionsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('[NotificationService] Permissão negada para notificações.');
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Lembretes Diários',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleDailyNotification(hour, minute, message) {
  // Cancela notificações anteriores para evitar duplicatas
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (hour === undefined || minute === undefined || !message) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Fofuras do Dia! 💌',
      body: message,
      sound: true,
    },
    trigger: {
      hour: Number(hour),
      minute: Number(minute),
      repeats: true,
    },
  });

  console.log(`[NotificationService] Notificação diária agendada para ${hour}:${minute}`);
}
