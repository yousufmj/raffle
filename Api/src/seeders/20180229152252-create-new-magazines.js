let faker = require('faker');

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Magazines', create(), {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Magazines', null, {});
    }
};

let create = () =>{

    let entries = []
    for (let index = 0; index < 10; index++) {

        let random = {
            name: faker.commerce.productName(),
            website: faker.internet.url(),
        };

        entries.push(random);

    }

    return entries;
};