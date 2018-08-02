let faker = require('faker');



module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Competitions', create() , {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Competitions', null, {});
    }
};

let create = () =>{

    let entries = []
    for (let index = 0; index < 10; index++) {

        let random = {
            title: faker.commerce.productName(),
            magazineID: faker.random.number({min:1, max:5}),
            description: faker.lorem.paragraph(),
            startDate: new Date(faker.date.past(1)).toISOString().slice(0, 19).replace('T', ' '),
            expiryDate: new Date(faker.date.future(1)).toISOString().slice(0, 19).replace('T', ' '),
        };

        entries.push(random);

    }

    return entries;
};