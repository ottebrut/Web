'use strict';

/**
 * Телефонная книга
 */
const phoneBook = new Map();

/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineNumber – номер строки с ошибкой
 * @param {number} charNumber – номер символа, с которого запрос стал ошибочным
 */
function syntaxError(lineNumber, charNumber) {
    throw new Error(`SyntaxError: Unexpected token at ${lineNumber + 1}:${charNumber + 1}`);
}

const commands = {
    "Создай": Create,
    "Удали": Delete,
    "Добавь": Add,
    "Покажи": Show
}

/**
 * Выполнение запроса на языке pbQL
 * @param {string} initialQueries
 * @returns {string[]} - строки с результатами запроса
 */
function run(initialQueries) {
    const queries = initialQueries.split(';');

    const res = [];
    queries.forEach((query, line) => {
        if (line === queries.length - 1 && query === '') {
            return;
        }

        const index = query.indexOf(' ');
        if (index === -1) {
            syntaxError(line, 0);
        }

        const commandString = query.substring(0, index);
        if (!commands.hasOwnProperty(commandString)) {
            syntaxError(line, 0);
        }
        const command = commands[commandString];

        command(query, line, res);

        if (line === queries.length - 1) {
            syntaxError(line, query.length);
        }
    })

    return res;
}

function Create(query, line) {
    // Создай контакт <имя>

    if (query.substring(7, 15) !== "контакт ") {
        syntaxError(line, 7);
    }

    const nameString = query.substr(15);
    if (!phoneBook.has(nameString)) {
        phoneBook.set(nameString, {
            phones: [],
            mails: []
        });
    }
}

function parsePhonesAndMails(query, line, startIndex, queryPhones, queryMails) {
    let i = startIndex;

    const phoneLen = 11, phoneRegex = /\d{10} /;
    while (true) {
        if (query.substr(i, 8) === "телефон ") {
            i += 8;

            const phone = query.substr(i, phoneLen);
            if (!phone.match(phoneRegex)) {
                syntaxError(line, i);
            }
            queryPhones.push(phone);
            i += phoneLen;
        } else if (query.substr(i, 6) === "почту ") {
            i += 6;

            const mail = query.substring(i, query.indexOf(' ', i));
            if (mail.length === 0) {
                syntaxError(line, i);
            }
            queryMails.push(mail);
            i += mail.length + 1;
        } else {
            syntaxError(line, i);
        }

        if (query.substr(i, 2) === "и ") {
            i += 2;
        } else if (query.substr(i, 4) === "для ") {
            i += 4;
            break;
        } else {
            syntaxError(line, i);
        }
    }

    if (query.substr(i, 9) !== "контакта ") {
        syntaxError(line, i);
    }
    i += 9;

    return i;
}

function checkIfConsistRequest(value, key, request) {
    if (key.includes(request)) {
        return true;
    }
    for (let phone of value.phones) {
        if (phone.includes(request)) {
            return true;
        }
    }
    for (let mail of value.mails) {
        if (mail.includes(request)) {
            return true;
        }
    }
}

function Delete(query, line) {
    // Удали контакт <имя>
    // Удали контакты, где есть <запрос>
    // Удали {телефон <телефон> и почту <почта>} для контакта <имя>

    if (query.substring(6, 14) === "контакт ") {
        const nameString = query.substr(14);
        phoneBook.delete(nameString);
    } else if (query.substring(6, 16) === "контакты, ") {
        if (query.substring(16, 20) !== "где ") {
            syntaxError(line, 16);
        } else if (query.substring(20, 25) !== "есть ") {
            syntaxError(line, 20);
        }

        const request = query.substr(25);
        if (request.length === 0) {
            return;
        }

        phoneBook.forEach((value, key) => {
            if (checkIfConsistRequest(value, key, request)) {
                phoneBook.delete(key);
            }
        });
    } else {
        const queryPhones = [], queryMails = [];
        let i = parsePhonesAndMails(query, line, 6, queryPhones, queryMails);

        const nameString = query.substr(i);
        if (phoneBook.has(nameString)) {
            const contact = phoneBook.get(nameString);
            contact.phones = contact.phones.filter((phone) => !queryPhones.includes(phone));
            contact.mails = contact.mails.filter((mail) => !queryMails.includes(mail));
        }
    }
}

function Add(query, line) {
    // Добавь {телефон <телефон> и почту <почта>} для контакта <имя>

    const queryPhones = [], queryMails = [];
    let i = parsePhonesAndMails(query, line, 7, queryPhones, queryMails);

    const nameString = query.substr(i);
    if (phoneBook.has(nameString)) {
        const contact = phoneBook.get(nameString);
        for (let phone of queryPhones) {
            if (!contact.phones.includes(phone)) {
                contact.phones.push(phone);
            }
        }
        for (let mail of queryMails) {
            if (!contact.mails.includes(mail)) {
                contact.mails.push(mail);
            }
        }
    }
}

function Show(query, line, res) {
    // Покажи {почты и телефоны и имя} для контактов, где есть <запрос>

    const fields = [];
    let i = 7;
    while (true) {
        if (query.substr(i,6) === "почты ") {
            fields.push("mails");
            i += 6;
        } else if (query.substr(i, 9) === "телефоны ") {
            fields.push("phones");
            i += 9;
        } else if (query.substr(i, 4) === "имя ") {
            fields.push("name");
            i += 4;
        } else {
            syntaxError(line, i);
        }

        if (query.substr(i, 2) === "и ") {
            i += 2;
        } else if (query.substr(i, 4) === "для ") {
            i += 4;
            break;
        } else {
            syntaxError(line, i);
        }
    }

    if (query.substr(i, 11) !== "контактов, ") {
        syntaxError(line, i);
    }
    i += 11;
    if (query.substr(i, 4) !== "где ") {
        syntaxError(line, i);
    }
    i += 4;
    if (query.substr(i, 5) !== "есть ") {
        syntaxError(line, i);
    }
    i += 5;

    const request = query.substr(i);
    if (request.length === 0) {
        return;
    }

    phoneBook.forEach((value, key) => {
        if (checkIfConsistRequest(value, key, request)) {
            let contactFields = "";
            for (let field of fields) {
                if (field === "name") {
                    contactFields += `${key};`;
                } else if (field === "phones") {
                    let phones = "";
                    for (let phone of value.phones) {
                        phones += `+7 (${phone.substr(0, 3)}) ${phone.substr(3, 3)}-` +
                                  `${phone.substr(6, 2)}-${phone.substr(8, 2)},`;
                    }
                    contactFields += `${phones.slice(0, -1)};`
                } else {
                    let mails = "";
                    for (let mail of value.mails) {
                        mails += `${mail},`;
                    }
                    contactFields += `${mails.slice(0, -1)};`
                }
            }
            res.push(contactFields.slice(0, -1));
        }
    });
}

module.exports = { phoneBook, run };