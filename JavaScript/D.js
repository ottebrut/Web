/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let eventChains = {};
    let boundFunctions = {};

    function getLastEvent(event) {
        const lastIndex = event.lastIndexOf('.');
        if (lastIndex === -1) {
            return [null, event];
        }

        const currentEvent = event.substr(lastIndex + 1);
        const previousEvent = event.slice(0, -(currentEvent.length + 1));
        return [previousEvent, currentEvent];
    }

    function addEventChain(event) {
        while (true) {
            const [previousEvent, currentEvent] = getLastEvent(event);
            if (previousEvent == null) {
                return;
            }

            if (!eventChains.hasOwnProperty(previousEvent)) {
                eventChains[previousEvent] = new Set();
            }
            eventChains[previousEvent].add(currentEvent);

            event = previousEvent;
        }
    }

    function addEvent({event, context, handler, times = Infinity, frequency = 1}) {
        if (!boundFunctions.hasOwnProperty(event)) {
            boundFunctions[event] = new Map();
        }
        if (!boundFunctions[event].has(context)) {
            boundFunctions[event].set(context, []);
        }
        boundFunctions[event].get(context).push({ handler,
                                                  done: 0,
                                                  times: times,
                                                  frequency: frequency });
    }

    return {
        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         */
        on: function (event, context, handler) {
            addEventChain(event);
            addEvent({event, context, handler});
            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         */
        off: function (event, context) {
            if (!boundFunctions.hasOwnProperty(event)) {
                return this;
            }
            boundFunctions[event].delete(context);

            if (eventChains.hasOwnProperty(event)) {
                eventChains[event].forEach((eventChild) => {
                    this.off(event + '.' + eventChild, context);
                });
            }
            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         */
        emit: function (event) {
            if (boundFunctions.hasOwnProperty(event)) {
                boundFunctions[event].forEach((handlers, context) => {
                    handlers.forEach((handler) => {
                        if (handler.done < handler.times) {
                            if (handler.done % handler.frequency === 0) {
                                handler.handler.apply(context);
                            }
                            handler.done++;
                        }
                    })
                });
            }

            const [previousEvent] = getLastEvent(event);
            if (previousEvent === null) {
                return this;
            }
            return this.emit(previousEvent);
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         */
        several: function (event, context, handler, times) {
            addEvent({event, context, handler, times});
            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         */
        through: function (event, context, handler, frequency) {
            addEvent({event, context, handler, frequency});
            return this;
        }
    };
}

module.exports = {
    getEmitter
};
