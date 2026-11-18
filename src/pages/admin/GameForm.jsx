import { useState } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { X, Save, Plus, Gamepad2, Download, ImageOff, Github } from 'lucide-react';
import { GENRES, genreName, platformName } from '../../services/labels';
import { errorMessage } from '../../services/errors';

const EMPTY = {
  name: '',
  description: '',
  genre: 'Action',
  type: 'pc',
  releaseDate: '',
  fileSize: '',
  downloadUrl: '',
  coverImage: '',
  screenshotsText: '',
};

const isHttps = (value) => /^https:\/\/\S+$/.test(value);

function toForm(game) {
  if (!game) return EMPTY;
  return {
    ...EMPTY,
    ...game,
    screenshotsText: (game.screenshots || []).join('\n'),
  };
}

export default function GameForm({ game, onClose, onSaved }) {
  const [form, setForm] = useState(() => toForm(game));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const screenshots = form.screenshotsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const validate = () => {
    if (!form.name.trim()) return 'Укажите название игры.';
    if (!isHttps(form.downloadUrl.trim())) return 'Ссылка на скачивание должна начинаться с https://';
    if (form.coverImage.trim() && !isHttps(form.coverImage.trim())) return 'Ссылка на обложку должна начинаться с https://';
    const bad = screenshots.find((s) => !isHttps(s));
    if (bad) return `Ссылка на скриншот должна начинаться с https://: ${bad}`;
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      genre: form.genre,
      type: form.type,
      releaseDate: form.releaseDate,
      fileSize: form.fileSize.trim(),
      downloadUrl: form.downloadUrl.trim(),
      coverImage: form.coverImage.trim(),
      screenshots,
      rating: game?.rating || 0,
      downloads: game?.downloads || 0,
      updatedAt: new Date(),
    };
    try {
      if (game) {
        await updateDoc(doc(db, 'games', game.id), data);
      } else {
        await addDoc(collection(db, 'games'), { ...data, createdAt: new Date() });
      }
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{game ? 'Редактирование игры' : 'Новая игра'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <form id="game-form" className="form-grid" onSubmit={submit}>
            <div className="field span-2">
              <label>Название</label>
              <input value={form.name} onChange={set('name')} placeholder="Например, Elvo Tanks Battles" required />
            </div>

            <div className="field">
              <label>Жанр</label>
              <select value={form.genre} onChange={set('genre')}>
                {Object.keys(GENRES).map((key) => <option key={key} value={key}>{genreName(key)}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Платформа</label>
              <select value={form.type} onChange={set('type')}>
                <option value="pc">{platformName('pc')}</option>
                <option value="mobile">{platformName('mobile')}</option>
              </select>
            </div>

            <div className="field span-2">
              <label>Описание</label>
              <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Коротко о игре" />
            </div>

            <div className="field">
              <label>Дата выхода</label>
              <input type="date" value={form.releaseDate} onChange={set('releaseDate')} />
            </div>

            <div className="field">
              <label>Размер</label>
              <input value={form.fileSize} onChange={set('fileSize')} placeholder="180 МБ" />
            </div>

            <div className="field span-2">
              <label><Github size={14} /> Ссылка на скачивание (GitHub)</label>
              <input
                type="url"
                value={form.downloadUrl}
                onChange={set('downloadUrl')}
                placeholder="https://github.com/пользователь/репозиторий/releases/download/v1.0/game.zip"
                required
              />
              <span className="hint">Ссылка на файл релиза на GitHub. Должна начинаться с https://</span>
            </div>

            <div className="field span-2">
              <label>Иконка / обложка (ссылка на картинку)</label>
              <input
                type="url"
                value={form.coverImage}
                onChange={set('coverImage')}
                placeholder="https://raw.githubusercontent.com/.../cover.png"
              />
              <span className="hint">Прямая ссылка на изображение, например с GitHub (raw.githubusercontent.com).</span>
            </div>

            <div className="field span-2">
              <label>Скриншоты (по одной ссылке в строке)</label>
              <textarea
                rows={4}
                value={form.screenshotsText}
                onChange={set('screenshotsText')}
                placeholder={'https://raw.githubusercontent.com/.../shot1.png\nhttps://raw.githubusercontent.com/.../shot2.png'}
              />
            </div>

            {error && <div className="error span-2">{error}</div>}
          </form>

          <aside className="preview">
            <div className="preview-label">Предпросмотр</div>
            <div className="preview-card">
              {form.coverImage && isHttps(form.coverImage.trim()) ? (
                <img
                  src={form.coverImage.trim()}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="preview-cover-empty"><Gamepad2 size={36} /></div>
              )}
              <div className="preview-body">
                <div className="preview-title">{form.name || 'Название игры'}</div>
                <div className="meta">{genreName(form.genre)} · {platformName(form.type)}{form.fileSize ? ` · ${form.fileSize}` : ''}</div>
                <p className="preview-desc">{form.description || 'Описание появится здесь'}</p>
                <div className="preview-download"><Download size={14} /> {isHttps(form.downloadUrl.trim()) ? 'Ссылка на скачивание задана' : 'Ссылка на скачивание не задана'}</div>
              </div>
            </div>

            <div className="preview-label">Скриншоты ({screenshots.length})</div>
            {screenshots.length === 0 ? (
              <div className="thumbs-empty"><ImageOff size={16} /> Скриншотов пока нет</div>
            ) : (
              <div className="thumbs">
                {screenshots.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    onError={(e) => { e.currentTarget.style.opacity = '0.25'; }}
                  />
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="modal-foot">
          <button className="btn" type="button" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" type="submit" form="game-form" disabled={saving}>
            {saving ? 'Сохранение...' : game ? <><Save size={16} /> Сохранить</> : <><Plus size={16} /> Добавить игру</>}
          </button>
        </div>
      </div>
    </div>
  );
}
