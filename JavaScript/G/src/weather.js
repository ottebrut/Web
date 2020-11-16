'use strict';

const fetch = require('node-fetch');

const API_KEY = require('./key.json');

/**
 * @typedef {object} TripItem Город, который является частью маршрута.
 * @property {number} geoid Идентификатор города
 * @property {number} day Порядковое число дня маршрута
 */

class TripBuilder {
  constructor(geoids) {
    this.geoids = geoids;
    this.days = [];
    this.maxDays = Infinity;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества солнечных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `clear`;
   * * `partly-cloudy`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  sunny(daysCount) {
    while (daysCount--) {
      this.days.push('s');
    }
    return this;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества пасмурных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `cloudy`;
   * * `overcast`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  cloudy(daysCount) {
    while (daysCount--) {
      this.days.push('c');
    }
    return this;
  }

  /**
   * Метод, добавляющий условие максимального количества дней.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  max(daysCount) {
    this.maxDays = daysCount;
    return this;
  }

  /**
   * Метод, возвращающий Promise с планируемым маршрутом.
   * @returns {Promise<TripItem[]>} Список городов маршрута
   */
  build() {
    this.maxDays = Math.min(this.maxDays, this.days.length);

    let fetches = [];
    let len = this.days.length;
    for (let geoid of this.geoids) {
      fetches.push(
        fetch(`https://api.weather.yandex.ru/v2/forecast?limit=${len}&geoid=${geoid}&hours=false`)
          .then(res => res.json())
          .then(body => body.forecasts.map(forecast => forecast.parts.day_short.condition))
          .then(conditions =>
            conditions.map(condition => {
              if (condition === "clear" || condition === "partly-cloudy") return 's';
              else if (condition === "cloudy" || condition === "overcast") return 'c';
              else return 'n';
            }))
      );
    }

    return Promise.all(fetches)
      .then(daysConditions => {
        for (let i = 0; i < daysConditions.length; ++i) {
          // console.log(this.geoids[i]);
          // console.log(daysConditions[i]);
        }
        const days = this.days, daysAmount = this.days.length, maxDays = this.maxDays;

        function findDay (day, visitedCities) {
          if (day === daysAmount) {
            return [];
          }

          const commonDays = [];
          for (let i = 0; i < daysConditions.length; ++i) {
            if (visitedCities[i]) {
              commonDays.push({ days: 0, city: i });
              continue;
            }

            let commons = 0;
            for (let j = day; j < Math.min(day + maxDays, daysAmount); ++j) {
              if (daysConditions[i][j] !== days[j]) {
                break;
              }
              commons++;
            }
            commonDays.push({ days: commons, city: i });
          }
          commonDays.sort((a, b) => b.days - a.days);

          for (let i = 0; i < commonDays.length; ++i) {
            if (commonDays[i].days === 0) {
              continue;
            }

            visitedCities[commonDays[i].city] = true;
            const answers = findDay(day + commonDays[i].days, visitedCities);
            if (answers) {
              answers.push(commonDays[i]);
              return answers;
            }
            visitedCities[commonDays[i].city] = true;
          }

          return null;
        }
        const answers = findDay(0, new Array(daysConditions.length));
        if (!answers) {
          throw new Error("Не могу построить маршрут!");
        }

        const cities = [];
        let day = 1;
        for (let i = answers.length - 1; i >= 0; --i) {
          const geoid = this.geoids[answers[i].city];
          for (let j = 0; j < answers[i].days; ++j) {
            cities.push({ geoid, day });
            day++;
          }
        }
        return cities;
      });
  }
}

/**
 * Фабрика для получения планировщика маршрута.
 * Принимает на вход список идентификаторов городов, а
 * возвращает планировщик маршрута по данным городам.
 *
 * @param {number[]} geoids Список идентификаторов городов
 * @returns {TripBuilder} Объект планировщика маршрута
 * @see https://yandex.ru/dev/xml/doc/dg/reference/regions-docpage/
 */
function planTrip(geoids) {
  return new TripBuilder(geoids);
}

module.exports = {
  planTrip
};
