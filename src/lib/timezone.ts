import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Convert a user's local time to UTC for storage.
 */
export function localToUTC(localTime: Date, timezone: string): Date {
  return fromZonedTime(localTime, timezone);
}

/**
 * Convert UTC from DB to user's local time for display.
 */
export function utcToLocal(utcTime: Date, timezone: string): Date {
  return toZonedTime(utcTime, timezone);
}

/**
 * Format a UTC time in the user's timezone.
 */
export function formatInTimezone(
  utcTime: Date,
  timezone: string,
  formatStr: string = "MMM d, yyyy h:mm a"
): string {
  const zonedTime = toZonedTime(utcTime, timezone);
  return format(zonedTime, formatStr, { timeZone: timezone });
}

/**
 * Get offset string like "UTC+7" or "UTC-5".
 */
export function getTimezoneOffset(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value ?? "UTC";
}

/**
 * Get short timezone abbreviation like "PST", "ICT".
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
}

/**
 * Get a human-friendly city name from IANA timezone.
 * "America/New_York" → "New York"
 * "Asia/Ho_Chi_Minh" → "Ho Chi Minh"
 */
export function getTimezoneCityName(timezone: string): string {
  const city = timezone.split("/").pop() ?? timezone;
  return city.replace(/_/g, " ");
}

/**
 * Common IANA timezones grouped by region for the selector.
 */
export const TIMEZONE_GROUPS = {
  Americas: [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "America/Bogota",
    "America/Lima",
  ],
  "Europe & Africa": [
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Amsterdam",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Stockholm",
    "Europe/Zurich",
    "Europe/Moscow",
    "Europe/Istanbul",
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
  ],
  "Asia & Pacific": [
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Asia/Bangkok",
    "Asia/Ho_Chi_Minh",
    "Asia/Jakarta",
    "Asia/Singapore",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Seoul",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
  ],
} as const;

/**
 * Flat list of all timezone options with metadata.
 */
export function getAllTimezoneOptions() {
  const options: Array<{
    value: string;
    label: string;
    city: string;
    offset: string;
    abbreviation: string;
    region: string;
  }> = [];

  for (const [region, zones] of Object.entries(TIMEZONE_GROUPS)) {
    for (const tz of zones) {
      options.push({
        value: tz,
        label: `${getTimezoneCityName(tz)} (${getTimezoneOffset(tz)})`,
        city: getTimezoneCityName(tz),
        offset: getTimezoneOffset(tz),
        abbreviation: getTimezoneAbbreviation(tz),
        region,
      });
    }
  }

  return options;
}
