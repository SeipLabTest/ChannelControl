/**
 * Merge splitted String
 *
 * @param arr
 * @param start
 * @param del
 * @returns {*}
 */
function mergeSplitString(arr, start, del) {

    if (arr.length > start) {
        for (let i = start; i < arr.length; i++) {
            arr[start - 1] = arr[start - 1] + del + arr[i];
        }
    }

    return arr[start - 1];

}

/**
 * Check if variable is empty.
 *
 * @param v
 * @returns {boolean}
 */
function isEmpty(v) {
    return (v === '' || v === ' ' || typeof v === 'undefined' || v.length === 0 || v === null)
}

/**
 * Check if variable is an object
 *
 * @param v
 * @returns {boolean}
 */
function isObject(v) {
    return (typeof v == 'object' && v !== null && !Array.isArray(v));
}

/**
 * Returns a random decimal number between min and max
 *
 * @param min
 * @param max
 * @returns {number}
 */
function getRandomDecimalNumber(min, max) {

    let random = new Random();
    return random.real(min, max);

}

/**
 * Returns a random number between min and max
 *
 * @param min
 * @param max
 * @returns {number}
 */
function getRandomNumber(min, max) {

    let random = new Random();
    return random.integer(min, max);

}

function getRandomBool(percentage) {

    let random = new Random();

    if (isEmpty(percentage)) {
        return random.bool();
    }
    else {
        return random.bool(percentage);
    }

}

/**
 * Removes illegal characters like:
 * [ ] ( ) <> { } / \ %
 *
 * @param string
 * @returns {string | void | *}
 */
function getEscapedString(string) {
    let filter = /[\\%"\]\[{}()]/g;
    if (_CFG.General.Access === "Lite") {
        filter = /[\\%"<>\]\[{}()]/g;
    }
    return string.replace(filter, '');
}

/**
 * Convert a number to String with german decimal
 * separator and thousands separators
 *
 * @param c
 * @returns {string|XML}
 */
Number.prototype.toLocaleNumberFormat = function (c) {
    let b = this;

    if (this < 0) {
        b = Math.abs(b);
    }

    let n = b.toFixed(c);
    let temp = n.split('.');
    let ns = temp[0].replace('.', ',');
    let w = [];
    let s, a;

    while (ns.length > 0) {

        a = ns.length;

        if (a >= 3) {
            s = ns.substr(a - 3);
            ns = ns.substr(0, a - 3);
        }
        else {
            s = ns;
            ns = "";
        }

        w.push(s);
    }

    for (i = w.length - 1; i >= 0; i--) {
        ns += w[i] + ".";
    }

    ns = ns.substr(0, ns.length - 1);
    ns += ',' + temp[1];

    if (this < 0) {
        ns = '-' + ns;
    }

    return ns.replace(/\.,/, ',');
};

/**
 * By Vampiric Desire
 * https://forum.knuddels.de/ubbthreads.php?ubb=showflat&Number=2768142#Post2768142
 *
 * @param obj
 * @returns {string}
 */
String.prototype.formater = function formater(obj) {
    var str = this.toString();

    var array = [];
    for (var key in obj) {
        array.push({key: key, value: obj[key]});
    }

    array.sort(function (a, b) {
        return b.key.length - a.key.length;
    });

    for (var i in array) {
        var key = array[i].key;
        var value = array[i].value;

        var ind = -1;
        var find = '$' + key;
        while ((ind = str.indexOf(find)) >= 0) {
            str = str.substring(0, ind) + value + str.substr(ind + find.length);
        }
    }

    return str;
};
