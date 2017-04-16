var bookshelf = require('../bookshelf');

var Pokemon = bookshelf.Model.extend({
  tableName: 'pokemons',
});

module.exports = Pokemon;
