let faker = require('faker');

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Terms', create(), {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Terms', null, {});
    }
};

let create = () =>{

    let entries = []
    for (let index = 0; index < 10; index++) {

        let random = {
            title: faker.commerce.product(),
            description: faker.lorem.paragraphs()
        };

        entries.push(random);

    }

    return entries;
};
