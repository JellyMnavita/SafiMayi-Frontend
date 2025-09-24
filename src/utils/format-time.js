import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
// ----------------------------------------------------------------------
/**
 * @Docs
 * https://day.js.org/docs/en/display/format
 */
/**
 * Default timezones
 * https://day.js.org/docs/en/timezone/set-default-timezone#docsNav
 *
 */
/**
 * UTC
 * https://day.js.org/docs/en/plugin/utc
 * @install
 * import utc from 'dayjs/plugin/utc';
 * dayjs.extend(utc);
 * @usage
 * dayjs().utc().format()
 *
 */
dayjs.extend(duration);
dayjs.extend(relativeTime);
export const formatPatterns = {
    dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
    date: 'DD MMM YYYY', // 17 Apr 2022
    time: 'h:mm a', // 12:00 am
    split: {
        dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
        date: 'DD/MM/YYYY', // 17/04/2022
    },
    paramCase: {
        dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
        date: 'DD-MM-YYYY', // 17-04-2022
    },
};
const isValidDate = (date) => date !== null && date !== undefined && dayjs(date).isValid();
// ----------------------------------------------------------------------
/**
 * @output 17 Apr 2022 12:00 am
 */
export function fDateTime(date, template) {
    if (!isValidDate(date)) {
        return 'Invalid date';
    }
    return dayjs(date).format(template ?? formatPatterns.dateTime);
}
// ----------------------------------------------------------------------
/**
 * @output 17 Apr 2022
 */
export function fDate(date, template) {
    if (!isValidDate(date)) {
        return 'Invalid date';
    }
    return dayjs(date).format(template ?? formatPatterns.date);
}
// ----------------------------------------------------------------------
/**
 * @output a few seconds, 2 years
 */
export function fToNow(date) {
    if (!isValidDate(date)) {
        return 'Invalid date';
    }
    return dayjs(date).toNow(true);
}
