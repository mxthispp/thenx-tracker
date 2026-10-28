import { ACTIVITIES, WORKOUTS, DAY_NAMES, getSchedule, weekConfig, youtubeUrl, fmtTs } from '../data/program';
import { addDays, programDate, toKey } from './dates';
import { buildWorkoutSequence, sequenceDuration } from './sequence';

const pad = (n) => String(n).padStart(2, '0');
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const localDT = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const dateOnly = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

const escape = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');

/** Plie les lignes à 75 octets (RFC 5545) sans couper un caractère UTF-8. */
function fold(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = parts.length ? 74 : 75;
    if (bytes + b > limit) {
      parts.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

function sessionDescription(wids, cfg) {
  const lines = [`Semaine ${cfg.n} — ${cfg.name} (${cfg.level})`, `Timer : ${cfg.work}s effort / ${cfg.rest}s repos × ${cfg.rounds} tours`, cfg.focus, ''];
  wids.forEach((wid) => {
    const w = WORKOUTS[wid];
    lines.push(`▶ ${w.title} — ${w.videoTitle}`);
    lines.push(youtubeUrl(w.youtubeId));
    w.exercises.forEach((ex, i) => lines.push(`${i + 1}. ${ex.name}${ex.ts ? ` (${fmtTs(ex.ts)})` : ''} — ${ex.fr}`));
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function buildIcs(state) {
  const { startDate, settings } = state;
  const schedule = getSchedule(settings.scheduleVariant);
  const [hh, mm] = (settings.sessionTime || '18:30').split(':').map(Number);
  const now = stamp(new Date());
  const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//THENX Tracker//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Programme THENX 4 semaines'];

  for (let w = 1; w <= 4; w++) {
    const cfg = weekConfig(w, settings);
    schedule.forEach((day, di) => {
      const date = programDate(startDate, w, di);
      if (day.session.length) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm);
        const minutes = sequenceDuration(buildWorkoutSequence(day.session, cfg)) / 60 + 10; // + échauffement
        const end = new Date(start.getTime() + Math.ceil(minutes / 5) * 5 * 60000);
        const title = day.session.map((wid) => WORKOUTS[wid].title).join(' + ');
        out.push(
          'BEGIN:VEVENT',
          `UID:thenx-${toKey(date)}-${day.session.join('-')}@thenx-tracker`,
          `DTSTAMP:${now}`,
          `DTSTART:${localDT(start)}`,
          `DTEND:${localDT(end)}`,
          `SUMMARY:${escape(`💪 THENX S${w} · ${title}`)}`,
          `DESCRIPTION:${escape(`${DAY_NAMES[di]} — ${day.note}\n\n${sessionDescription(day.session, cfg)}`)}`,
          `URL:${youtubeUrl(WORKOUTS[day.session[0]].youtubeId)}`,
          'CATEGORIES:Callisthénie',
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          `DESCRIPTION:${escape(`${title} dans 30 min`)}`,
          'TRIGGER:-PT30M',
          'END:VALARM',
          'END:VEVENT',
        );
      }
      if (settings.icsIncludeSports) {
        day.activities.filter((a) => !ACTIVITIES[a].optional).forEach((aid) => {
          const a = ACTIVITIES[aid];
          out.push(
            'BEGIN:VEVENT',
            `UID:thenx-${toKey(date)}-${aid}@thenx-tracker`,
            `DTSTAMP:${now}`,
            `DTSTART;VALUE=DATE:${dateOnly(date)}`,
            `DTEND;VALUE=DATE:${dateOnly(addDays(date, 1))}`,
            `SUMMARY:${escape(`${a.emoji} ${a.title} — ${a.subtitle}`)}`,
            `DESCRIPTION:${escape(`Semaine ${w} — ${day.note}`)}`,
            'TRANSP:TRANSPARENT',
            'END:VEVENT',
          );
        });
      }
    });
  }
  out.push('END:VCALENDAR');
  return out.map(fold).join('\r\n') + '\r\n';
}
