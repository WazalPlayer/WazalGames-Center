export const GENRES = {
  Action: 'Экшен',
  Adventure: 'Приключения',
  RPG: 'RPG',
  Strategy: 'Стратегия',
  Puzzle: 'Головоломка',
  Shooter: 'Шутер',
};

export const PLATFORMS = {
  pc: 'ПК',
  mobile: 'Мобильная',
};

export const genreName = (key) => GENRES[key] || key || '—';
export const platformName = (key) => PLATFORMS[key] || '—';
