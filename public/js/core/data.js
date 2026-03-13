/**
 * @fileoverview Arcamis — Page Registry
 *
 * Unica fonte di verità per i metadati delle pagine.
 * Zero logica: solo dati esportati.
 *
 * @module core/data
 */

/** @typedef {{ k: string, l: string, i: string, id: string }} PageMeta */

export const ROOT_PAGE_ID  = '2f00274fdc1c801a9b39d8d69800f7a8';
export const DISCORD_GUILD = '1348723468157456425';
export const DISCORD_INVITE = 'https://discord.gg/JZPnXZbXEJ';

/** @type {Readonly<PageMeta[]>} */
export const PAGES = Object.freeze([
  { k: 'gameplay',   l: 'Gameplay',                 i: '⚔️',  id: '2f00274fdc1c8065a11ff45192aa5dcb' },
  { k: 'regole',     l: 'Regole',                   i: '📜',  id: '2f00274fdc1c800b9d8fc366e8e40c5c' },
  { k: 'materiale',  l: 'Materiale approvato',       i: '📋',  id: '3130274fdc1c807eb61fde24e8236659' },
  { k: 'inizia',     l: 'Come si inizia',            i: '🌟',  id: '2dd222f22ef8413f8cb48f03bbb4f4b0' },
  { k: 'avanti',     l: 'Andando avanti',            i: '📈',  id: '5cea525d149f4acb9c59007bf6b3d5ff' },
  { k: 'galleria',   l: 'Galleria PG',              i: '🖼️', id: '2fd0274fdc1c80d8b948c4133f874f28' },
  { k: 'homebrew',   l: 'Homebrew',                  i: '⚗️',  id: '2f00274fdc1c80e78ad7ce985007b7c6' },
  { k: 'biblioteca', l: 'Biblioteca',               i: '📚',  id: '2f00274fdc1c8089bfe6c24434d53b67' },
  { k: 'farmacia',   l: 'Bottega farmaceutica',     i: '💊',  id: '2f00274fdc1c801c9697e75caa8d5f13' },
  { k: 'caserma',    l: 'Caserma',                   i: '🛡️', id: '2ff0274fdc1c80688dd6c2b293a1f626' },
  { k: 'costruttori',l: 'Corporazione costruttori',  i: '🔨',  id: '2ff0274fdc1c80769a4ae243f22f0582' },
  { k: 'forgia',     l: 'Forgia',                    i: '🔥',  id: '2f00274fdc1c805ca01ec57f18d2ffee' },
  { k: 'gilda',      l: 'Gilda degli avventurieri',  i: '🗡️', id: '2f00274fdc1c801b8c13cefd9e15694e' },
  { k: 'locanda',    l: 'Locanda',                   i: '🍺',  id: '2f00274fdc1c80faa99eda064ef0fabc' },
  { k: 'ospedale',   l: 'Ospedale',                  i: '⚕️', id: '2f00274fdc1c807aa03cc6cbeb3687cc' },
  { k: 'sartoria',   l: 'Sartoria',                  i: '🧵',  id: '2ff0274fdc1c8035bad4f0b6ab705192' },
  { k: 'pantheon',   l: 'Pantheon',                  i: '🛐',  id: '2f00274fdc1c80679bd3c3df8a1fa040' },
  { k: 'lore',       l: 'Lore',                      i: '📖',  id: '2f00274fdc1c806f8f17dbc6532d2211' },
  { k: 'mappe',      l: 'Mappe',                     i: '🗺️', id: '2f10274fdc1c80489f23c49164747770' },
  { k: 'maestria',   l: 'Maestria / Titoli',         i: '🏅',  id: '2f00274fdc1c802a9babd4239d97a319' },
  { k: 'changelog',  l: 'Changelog',                 i: '📝',  id: '3000274fdc1c8033a214c44a1aa7f01f' },
  { k: 'arcamis',    l: 'Arcamis',                   i: '🏰',  id: '3090274fdc1c80e1a365ce1c36873455' },
  { k: 'selva',      l: 'Selva Fogliabruna',         i: '🍂',  id: '30d0274fdc1c800999feeb0ca6669b22' },
  { k: 'foresta',    l: 'Foresta Smarrimento',       i: '🌲',  id: '30d0274fdc1c8016b113d5c2d7662d8f' },
  { k: 'volonx',     l: 'Volonx',                    i: '🏔️', id: '30d0274fdc1c804b9cb7e366f02bd635' },
  { k: 'vigilius',   l: 'Vigilius',                  i: '🏛️', id: '31f0274fdc1c8059a923c73da185a0e3' },
  { k: 'galeton',    l: 'Galeton',                   i: '🛤️', id: '31f0274fdc1c8019945af2b26306462f' },
]);

// Indice O(1) per lookup veloce — costruito una volta sola
const _byId  = new Map(PAGES.map(p => [p.id, p]));
const _byKey = new Map(PAGES.map(p => [p.k, p]));

/**
 * Trova una pagina per ID Notion o chiave slug.
 * @param {string} idOrKey
 * @returns {PageMeta|undefined}
 */
export function getPage(idOrKey) {
  return _byId.get(idOrKey) ?? _byKey.get(idOrKey);
}

// Retrocompatibilità: espone le variabili globali che notion-render.js usa ancora
// Rimuovere gradualmente man mano che si migra notion-render.
if (typeof window !== 'undefined') {
  window.pages   = PAGES;
  window.getPage = getPage;
}
