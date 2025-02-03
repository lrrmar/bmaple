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

// Return timestamp as local date string 
function dateDisplayString(timestamp : number | undefined) {
  if (!timestamp) { return '' };
  const date = new Date(timestamp);
  if (!date) { return ''; }
  const dayOfWeek = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  return `${dayOfWeek} ${day} ${month}`;
}

// Return timestamp as local date and time string 
function dateTimeDisplayString(timestamp : number  | undefined) {
  if (!timestamp) { return '' };
  const date = new Date(timestamp);
  if (!date) { return ''; }
  const dayOfWeek = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dayOfWeek} ${day} ${month} ${hours}:${minutes}`;
}

// Return timestamp as local time string 
function timeDisplayString(timestamp : number  | undefined) {
  if (!timestamp) { return '' };
  const date = new Date(timestamp);
  if (!date) { return ''; }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  var str = `${hours}:${minutes}`;
  return str;
}


function timezoneOffsetString(date : Date) {
  const tz = String(date.getTimezoneOffset()).padStart(2, '0') + ':00';
  return `${tz}`;
}

function timezoneDisplayString(timestamp : number | undefined) {

  // Ask specifically for the long-form of the time zone name in the options
  const dtf = Intl.DateTimeFormat(undefined, {timeZoneName: 'long'});

  if (!timestamp) { return '' };
  const date = new Date(timestamp);
  
  // Format the date to parts, and pull out the value of the time zone name
  const tsParts = dtf.formatToParts(date);
  return tsParts.find(
      (part) => part.type == 'timeZoneName')?.value ?? "[undefined timezone]";
}


export {
  dateAsUrlParamString,
  dateDisplayString,
  dateTimeDisplayString,
  timeDisplayString,
  timezoneDisplayString,
  timezoneOffsetString };
