function dateAsUrlParamString(date : Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}/${month}/${day}/${hours}/${minutes}`;
}

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function dateAsDisplayString(date : Date | undefined) {
  if (!date) { return ''; }
  const dayOfWeek = days[date.getUTCDay()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dayOfWeek} ${day} ${month} ${hours}:${minutes}`;
}

function timeAsDisplayString(date : Date | undefined) {
  if (!date) { return '' }
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function timestampAsDisplayString(timestamp : number | undefined) {
  if (!timestamp) { return '' };
  return timeAsDisplayString(new Date(timestamp));
}

function timestampAsDateTimeDisplayString(timestamp : number | undefined) {
  if (!timestamp) { return '' };
  const dt = new Date(timestamp);
  return dateAsDisplayString(dt);
}

function timestampAsDateDisplayString(timestamp : number | undefined) {
  if (!timestamp) { return '' };
  const date = new Date(timestamp);
  const dayOfWeek = days[date.getUTCDay()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  return `${dayOfWeek} ${day} ${month}`;
}

function timezoneAsOffsetString(date : Date) {
  const tz = String(date.getTimezoneOffset()).padStart(2, '0') + ':00';
  return `${tz}`;
}

function timezoneAsDisplayString(date : Date) {

  // Ask specifically for the long-form of the time zone name in the options
  const dtf = Intl.DateTimeFormat(undefined, {timeZoneName: 'long'});

  // Format the date to parts, and pull out the value of the time zone name
  const tsParts = dtf.formatToParts(date);
  return tsParts.find(
      (part) => part.type == 'timeZoneName')?.value ?? "[undefined timezone]";
}


export { dateAsUrlParamString,
  dateAsDisplayString,
  timeAsDisplayString,
  timestampAsDisplayString,
  timestampAsDateTimeDisplayString,
  timestampAsDateDisplayString,
  timezoneAsDisplayString,
  timezoneAsOffsetString };
