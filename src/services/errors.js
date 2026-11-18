const MESSAGES = {
  'auth/invalid-email': 'Некорректный email.',
  'auth/missing-password': 'Введите пароль.',
  'auth/invalid-credential': 'Неверный email или пароль.',
  'auth/user-not-found': 'Пользователь с таким email не найден.',
  'auth/wrong-password': 'Неверный пароль.',
  'auth/email-already-in-use': 'Этот email уже зарегистрирован.',
  'auth/weak-password': 'Пароль должен быть не короче 6 символов.',
  'auth/too-many-requests': 'Слишком много попыток. Подождите немного.',
  'auth/network-request-failed': 'Нет соединения с интернетом.',
  'auth/popup-closed-by-user': 'Окно входа закрыто до завершения.',
  'auth/unauthorized-domain': 'Этот адрес не разрешён в настройках Firebase.',
  'permission-denied': 'Недостаточно прав для этого действия.',
};

export function errorMessage(err) {
  return MESSAGES[err?.code] || MESSAGES[err?.message] || 'Что-то пошло не так. Попробуйте ещё раз.';
}
