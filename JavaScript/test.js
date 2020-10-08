const assert = require("assert");
const robbery = require("./C");

const gangSchedule = {
    Danny: [{ from: 'ПН 12:00+5', to: 'ПН 17:00+5' }, { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }],
    Rusty: [{ from: 'ПН 11:30+5', to: 'ПН 16:30+5' }, { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }],
    Linus: [
        { from: 'ПН 09:00+3', to: 'ПН 14:00+3' },
        { from: 'ПН 21:00+3', to: 'ВТ 09:30+3' },
        { from: 'СР 09:30+3', to: 'СР 15:00+3' }
    ]
};

const bankWorkingHours = {
    from: '10:00+5',
    to: '18:00+5'
};

describe('robbery.run', () => {
    // beforeEach(() => {
    //     B.phoneBook.clear();
    // });
    it('FirstTest', () => {
        assert.strictEqual(true, true);
    });
    it('Пример 1', () => {
        const longMoment = robbery.getAppropriateMoment(gangSchedule, 121, bankWorkingHours);
        assert.strictEqual(longMoment.exists(), false);
        assert.strictEqual(longMoment.format('Метим на %DD, старт в %HH:%MM!'), "");
    });
    it('Пример 2', () => {
        const moment = robbery.getAppropriateMoment(gangSchedule, 90, bankWorkingHours);
        assert.strictEqual(moment.exists(), true);
        assert.strictEqual(moment.format('Метим на %DD, старт в %HH:%MM!'), "Метим на ВТ, старт в 11:30!");
    });
    // it('Пример 3', () => {
    //     const longMoment = robbery.getAppropriateMoment(gangSchedule, 121, bankWorkingHours);
    //     assert.strictEqual(longMoment.exists(), false);
    //     assert.strictEqual(longMoment.format(), "");
    // });
    // it('Пример 4', () => {
    //     const longMoment = robbery.getAppropriateMoment(gangSchedule, 121, bankWorkingHours);
    //     assert.strictEqual(longMoment.exists(), false);
    //     assert.strictEqual(longMoment.format(), "");
    // });
});