'use strict';

function getTime(timeString, timezone) {
    let time = 0, maxTime = 71 * 60 + 59;
    if (timeString.substr(0, 2) === "ВТ") {
        time += 24 * 60;
    } else if (timeString.substr(0, 2) === "СР") {
        time += 48 * 60;
    } else if (timeString.substr(0, 2) !== "ПН") {
        return maxTime;
    }
    time += Number(timeString.substr(3, 2)) * 60 +
            Number(timeString.substr(6, 2)) +
            (timezone - Number(timeString.substr(9))) * 60;

    return Math.min(Math.max(0, time), maxTime);
}

function isEqualTime(time1, time2) {
    time1 %= 24 * 60;
    return time1 === time2;
}

function getFreeTimeStart(scheduleTimes, duration, workingHours, minTime = 0) {
    let maxTime = 72 * 60;

    let openTime = workingHours.from.substr(0, 2) * 60 +
        Number(workingHours.from.substr(3, 2));
    let closeTime = workingHours.to.substr(0, 2) * 60 +
        Number(workingHours.to.substr(3, 2));

    let balance = 0, freeTimeStart = -1, freeTimeDuration, started = false;
    for (let time = 0; time <= maxTime; time++) {
        if (time === maxTime) {
            freeTimeStart = -1;
            break;
        }

        if (!started && isEqualTime(time, openTime)) {
            started = true;
        }
        if (started && isEqualTime(time, closeTime)) {
            started = false;
        }

        balance += scheduleTimes[time];
        if (started && time >= minTime && balance === 0) {
            if (freeTimeStart === -1) {
                freeTimeStart = time;
                freeTimeDuration = 1;
            } else {
                freeTimeDuration++;
            }
            if (freeTimeDuration === duration) {
                return freeTimeStart;
            }
        } else {
            freeTimeStart = -1;
        }
    }

    return -1;
}

/**
 * @param {Object} schedule Расписание Банды
 * @param {number} duration Время на ограбление в минутах
 * @param {Object} workingHours Время работы банка
 * @param {string} workingHours.from Время открытия, например, "10:00+5"
 * @param {string} workingHours.to Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    let names = ["Danny", "Rusty", "Linus"];
    let timezone = workingHours.from.substr(6);

    let maxTime = 72 * 60, scheduleTimes = [];
    for (let i = 0; i < maxTime; i++) {
        scheduleTimes[i] = 0;
    }

    for (let name of names) {
        for (let time of schedule[name]) {
            scheduleTimes[getTime(time.from, timezone)]++;
            scheduleTimes[getTime(time.to, timezone)]--;
        }
    }

    let freeTimeStart = getFreeTimeStart(scheduleTimes, duration, workingHours);

    return {
        appropriateTime: freeTimeStart,
        /**
         * Найдено ли время
         * @returns {boolean}
         */
        exists() {
            return this.appropriateTime !== -1;
        },

        /**
         * Возвращает отформатированную строку с часами
         * для ограбления во временной зоне банка
         *
         * @param {string} template
         * @returns {string}
         *
         * @example
         * ```js
         * getAppropriateMoment(...).format('Начинаем в %HH:%MM (%DD)') // => Начинаем в 14:59 (СР)
         * ```
         */
        format(template) {
            if (this.exists() === false) {
                return "";
            }

            let time = this.appropriateTime;

            let day = Math.floor(time / (24 * 60)), dayString;
            if (day === 0) {
                dayString = "ПН";
            } else if (day === 1) {
                dayString = "ВТ";
            } else {
                dayString = "СР";
            }
            time -= day * 24 * 60;

            let hours = Math.floor(time / 60).toString().padStart(2, '0');
            let minutes = (time % 60).toString().padStart(2, '0');

            return template.replace("%DD", dayString)
                           .replace("%HH", hours)
                           .replace("%MM", minutes);
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @note Не забудь при реализации выставить флаг `isExtraTaskSolved`
         * @returns {boolean}
         */
        tryLater() {
            let freeTimeStart = getFreeTimeStart(scheduleTimes, duration, workingHours, this.appropriateTime + 30);
            if (freeTimeStart === -1) {
                return false;
            } else {
                this.appropriateTime = freeTimeStart;
                return true;
            }
        }
    };
}

module.exports = {
    getAppropriateMoment
};