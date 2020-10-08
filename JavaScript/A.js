'use strict';

function checkType(val, type) {
    if (typeof val !== type) {
        throw new TypeError(`Parameter must be of type: ${type}`);
    }
}

/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    checkType(a, 'number');
    checkType(b, 'number');
    return a + b;
}

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    checkType(year, 'number');
    if (year < 0) {
        throw new RangeError('Year must be positive');
    }
    return Math.floor((year + 99) / 100);
}

/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */
function colorsProblem(hexColor) {
    checkType(hexColor, 'string');
    if (hexColor[0] !== '#' || hexColor.length !== 7) {
        throw new RangeError('HEX must be in format #FFFFFF');
    }
    hexColor = hexColor.toUpperCase();
    for (let i = 1; i < 7; i++) {
        if (!(('0' <= hexColor[i] && hexColor[i] <= '9') || ('A' <= hexColor[i] && hexColor[i] <= 'F'))) {
            throw new RangeError('HEX must be in format #FFFFFF');
        }
    }
    let ans = '(';
    for (let i = 1; i < 7; i += 2) {
        ans += parseInt('0x' + hexColor.substr(i, 2));
        if (i < 5) {
            ans += ', '
        }
    }
    ans += ')';
    return ans;
}

/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    checkType(n, 'number');
    if (n <= 0 || !Number.isInteger(n)) {
        throw new RangeError('Number must be positive integer')
    }
    let a = 0, b = 1, c;
    for (let i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}

/**
 * Транспонирует матрицу
 * @param {(Any[])[]} matrix Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(matrix) {
    if (!Array.isArray(matrix) || (matrix.length !== 0 && !Array.isArray(matrix[0]))) {
        throw new TypeError('Parameter must be 2 dimensional MxN array');
    }
    if (matrix.length === 0) {
        return [];
    }
    let m = matrix.length, n = matrix[0].length;
    for (let i = 1; i < m; i++) {
        if (!Array.isArray(matrix[i]) || matrix[i].length !== n) {
            throw new TypeError('Parameter must be 2 dimensional MxN array');
        }
    }
    let newMatrix = [];
    for (let j = 0; j < n; j++) {
        newMatrix.push([]);
        for (let i = 0; i < m; i++) {
            newMatrix[j].push(matrix[i][j]);
        }
    }
    return newMatrix;
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numberSystemProblem(n, targetNs) {
    checkType(n, 'number');
    checkType(targetNs, 'number');
    return n.toString(targetNs);
}

/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    checkType(phoneNumber, 'string');
    return /^8-800-[0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(phoneNumber);
}

/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    checkType(text, 'string');
    let n = 0;
    for (let i = 0; i < text.length - 2; i++) {
        let smile = text.substr(i, 3);
        n += (smile === ":-)" || smile === "(-:");
    }
    return n;
}

/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function ticTacToeProblem(field) {
    for (let i = 0; i < 3; i++) {
        if (field[i][0] === field[i][1] && field[i][1] === field[i][2]) {
            return field[i][0];
        }
        if (field[0][i] === field[1][i] && field[1][i] === field[2][i]) {
            return field[0][i];
        }
    }
    if (field[0][0] === field[1][1] && field[1][1] === field[2][2]) {
        return field[0][0];
    }
    if (field[0][2] === field[1][1] && field[1][1] === field[2][0]) {
        return field[0][2];
    }
    return 'draw';
}

module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};