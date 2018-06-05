/**
 * German date formate (dd.mm.yyyy) to timestamp
 *
 * @param date
 * @returns {number}
 */
function dateToTimestamp(date) {

    date = date.split('.');
    date = date[2] + '/' + date[1] + '/' + date[0] + ' ' + '00:00:01';
    return Date.parse(date);

}

/**
 * Returns European Date and Time format from javascript timestamp.
 *
 * @param timestamp
 * @returns {Date}
 */
function timestampToDate(timestamp, form) {

    let date = new Date(timestamp);
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    let HH = date.getHours();
    let MM = date.getMinutes();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (HH < 10) {
        HH = '0' + HH;
    }

    if (MM < 10) {
        MM = '0' + MM;
    }

    switch (form) {
        case 0:
            date = dd + '.' + mm + '.' + yyyy + ' um ' + HH + ':' + MM + ' Uhr';
            break;
        case 1:
            date = dd + '.' + mm + '.' + yyyy;
            break;
        default:
            date = dd + '.' + mm + '.' + yyyy + ' um ' + HH + ':' + MM + ' Uhr';
            break;
    }


    return date;

}

function knuddelstimeToTimestamp(time) {
    return new Date(time).getTime();
}

function isValidDate(string) {

    if (string.length < 10) {
        return false;
    }

    let dateParts = string.split('.');
    let date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);

    return date.getDate() == dateParts[0] && date.getMonth() == (dateParts[1] - 1) && date.getFullYear() == dateParts[2];

}