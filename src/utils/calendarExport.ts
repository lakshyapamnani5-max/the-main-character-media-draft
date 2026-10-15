import { EventShoot, CrewMember } from '../types';

/**
 * Format a JavaScript Date or YYYY-MM-DD + time string into iCalendar format (YYYYMMDDTHHmmssZ or YYYYMMDD)
 */
function formatICSDate(dateStr: string, timeStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Parse YYYY-MM-DD
  const dateParts = dateStr.split('-');
  if (dateParts.length !== 3) {
    return dateStr.replace(/[-:]/g, '');
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  if (!timeStr) {
    // All day date
    return `${year}${month}${day}`;
  }

  // Parse time (e.g. "14:00", "08:00 AM", "02:30 PM")
  let hours = 9;
  let minutes = 0;

  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes('PM');
  const isAM = cleanTime.includes('AM');
  const timeOnly = cleanTime.replace(/[APM\s]/g, '');
  const [h, m] = timeOnly.split(':');

  if (h) {
    hours = parseInt(h, 10);
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }
  if (m) {
    minutes = parseInt(m, 10);
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  // Local floating time representation RFC 5545 (YYYYMMDDTHHMMSS)
  return `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
}

/**
 * Escape text for iCalendar format RFC 5545
 */
function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate iCalendar (.ics) RFC 5545 file string for one or multiple shoots
 */
export function generateICSContent(events: EventShoot[], crewMember?: CrewMember): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Main Character Media//Production ERP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:TMC Shoots Calendar',
    'X-WR-TIMEZONE:Asia/Kolkata'
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  events.forEach(event => {
    const startDate = event.startDate || (event as any).shootDate || new Date().toISOString().split('T')[0];
    const endDate = event.endDate || startDate;
    
    // Determine times from assignment or shootTime
    const myAssignment = crewMember ? event.crewAssignments?.find(a => a.crewId === crewMember.id) : null;
    const startTimeStr = myAssignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '09:00 AM';
    const endTimeStr = myAssignment?.wrapTime || event.shootTime?.split('-')[1]?.trim() || '21:00 PM';

    const dtStart = formatICSDate(startDate, startTimeStr);
    const dtEnd = formatICSDate(endDate, endTimeStr);

    let description = `Shoot: ${event.eventName}\\n`;
    description += `Type: ${event.eventType}\\n`;
    description += `Venue: ${event.venue}\\n`;

    if (crewMember) {
      const role = myAssignment?.role || crewMember.role;
      const payout = myAssignment?.payout || crewMember.defaultPayout;
      description += `Role: ${role}\\n`;
      description += `Call Time: ${startTimeStr}\\n`;
      description += `Wrap Time: ${endTimeStr}\\n`;
      if (payout) {
        description += `Compensation: INR ${payout.toLocaleString('en-IN')}\\n`;
      }
    } else {
      if (event.clientName) description += `Client: ${event.clientName}\\n`;
      if (event.crewMembers && event.crewMembers.length > 0) {
        description += `Crew: ${event.crewMembers.join(', ')}\\n`;
      }
    }

    if (event.notes) {
      description += `Notes: ${event.notes}\\n`;
    }

    description += `Organization: The Main Character Media`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:tmc-event-${event.id}@themaincharactermedia.com`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICSText(`${event.eventName} [${event.eventType}]`)}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${escapeICSText(event.venue || 'TBD Venue')}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of an .ics calendar file
 * Opens native calendar import on iOS (Safari/Chrome) and Android
 */
export function downloadICSFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate direct Google Calendar URL for Android / Web 1-tap addition
 */
export function getGoogleCalendarUrl(event: EventShoot, crewMember?: CrewMember): string {
  const startDate = event.startDate || (event as any).shootDate || new Date().toISOString().split('T')[0];
  const endDate = event.endDate || startDate;
  
  const myAssignment = crewMember ? event.crewAssignments?.find(a => a.crewId === crewMember.id) : null;
  const startTimeStr = myAssignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '09:00 AM';
  const endTimeStr = myAssignment?.wrapTime || event.shootTime?.split('-')[1]?.trim() || '21:00 PM';

  const startFormatted = formatICSDate(startDate, startTimeStr);
  const endFormatted = formatICSDate(endDate, endTimeStr);

  let details = `The Main Character Media Shoot: ${event.eventName}\nType: ${event.eventType}\nVenue: ${event.venue}\n`;
  if (crewMember) {
    details += `Your Role: ${myAssignment?.role || crewMember.role}\nCall Time: ${startTimeStr}\nWrap Time: ${endTimeStr}\n`;
    if (myAssignment?.payout) details += `Agreed Day Payout: ₹${myAssignment.payout.toLocaleString('en-IN')}\n`;
  }
  if (event.notes) details += `Production Notes: ${event.notes}\n`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🎬 ${event.eventName} (${event.eventType})`,
    dates: `${startFormatted}/${endFormatted}`,
    details,
    location: event.venue || 'Venue TBD',
    sprop: 'website:themaincharactermedia.com'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Export single shoot to Apple Calendar (iOS / iPhone)
 */
export function exportShootToAppleCalendar(event: EventShoot, crewMember?: CrewMember): void {
  const ics = generateICSContent([event], crewMember);
  const safeTitle = event.eventName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  downloadICSFile(`tmc_shoot_${safeTitle}.ics`, ics);
}

/**
 * Export single shoot to Google Calendar (Android / Web)
 */
export function exportShootToGoogleCalendar(event: EventShoot, crewMember?: CrewMember): void {
  const url = getGoogleCalendarUrl(event, crewMember);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Export multiple shoots to .ics (for bulk iOS / Android sync)
 */
export function exportAllShootsToICS(events: EventShoot[], crewMember?: CrewMember, filenamePrefix = 'tmc_shoots'): void {
  if (events.length === 0) return;
  const ics = generateICSContent(events, crewMember);
  downloadICSFile(`${filenamePrefix}_calendar.ics`, ics);
}
