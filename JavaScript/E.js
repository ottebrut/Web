'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    const markedFriends = new Set();
    let level = 0, levelFriends, filteredLevelFriends = [];

    function getNextLevel(maxLevel) {
        while (level < maxLevel) {
            const newLevelFriends = [];

            if (level === 0) {
                friends.filter(friend => friend.best)
                    .forEach((friend) => {
                        newLevelFriends.push(friend);
                        markedFriends.add(friend.name);
                    });
            } else {
                levelFriends.forEach((friend) => {
                    friend.friends
                        .filter(friendName => !markedFriends.has(friendName))
                        .forEach((friendName) => {
                            newLevelFriends
                                .push(friends.find(friend => friend.name === friendName));
                            markedFriends.add(friendName);
                        });
                });
            }
            levelFriends = newLevelFriends
                .sort((friendA, friendB) => friendA.name.localeCompare(friendB.name));

            filteredLevelFriends = levelFriends.filter(filter.filter);
            if (filteredLevelFriends.length > 0 || levelFriends.length === 0) {
                break;
            }
            level++;
        }
    }

    let index = 0, started = false;
    this.maxLevel = Infinity;

    this.done = function() {
        if (!started) {
            started = true;
            getNextLevel(this.maxLevel);
        }
        return index === filteredLevelFriends.length || level === this.maxLevel;
    }

    this.next = function() {
        if (this.done()) {
            return null;
        }

        const friend = filteredLevelFriends[index];

        index++;
        if (index === filteredLevelFriends.length) {
            level++;
            filteredLevelFriends = [];
            getNextLevel(this.maxLevel);
            index = 0;
        }

        return friend;
    }
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.maxLevel = maxLevel;
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter(filter) {
    this.filter = filter || (() => true);
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.call(this, friend => friend.gender === "male");
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.call(this, friend => friend.gender === "female");
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
