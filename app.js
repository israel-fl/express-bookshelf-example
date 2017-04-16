var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var Pokemon = require('./models/pokemon');

// Adding validation to our request parameters
const Joi = require('joi');
const pokemon_schema = Joi.object().keys({
    name: Joi.string(),
    type_1: Joi.string(),
    type_2: Joi.string(),
    total: Joi.number().integer(),
    hp: Joi.number().integer(),
    attack: Joi.number().integer(),
    defense: Joi.number().integer(),
    sp_atk: Joi.number().integer(),
    sp_def: Joi.number().integer(),
    speed: Joi.number().integer(),
    generation: Joi.number().integer(),
    legendary: Joi.string()
});

const pokemon_update_schema = Joi.object().keys({
    name: Joi.string()
});

app.use(bodyParser.json()); // for parsing application/json

app.get('/api/v1/pokemons', function(request, response) {
  Pokemon
    .query(function (qb) {
        qb.limit(20);  // limit displayed results to 20
    }).fetchAll().then(function(pokemon) {
        response.json(pokemon);
    });

});


app.get('/api/v1/pokemons/:id', function(request, response) {
  Pokemon
    .where('id', request.params.id)
    .fetch({ require: true })
    .then(function(pokemon) {
      response.json(pokemon);
    }, function(e) {
        response.status(404).json({
            error: {
              "success": false,
              message: "not_found"
            }
        });
    });
});


app.post('/api/v1/pokemons', function(request, response) {
    Joi.validate(request.body, pokemon_schema, { presence: "required" }, function(err, value) {
        // Check if the request matches the schema, the request MUST include all values
        if (err) {
            response.json(err);
        } else {
            var pokemon = new Pokemon({
                name: request.body.name,
                type_1: request.body.type_1,
                type_2: request.body.type_2,
                total: request.body.total,
                hp: request.body.hp,
                attack: request.body.attack,
                defense: request.body.defense,
                sp_atk: request.body.sp_atk,
                sp_def: request.body.sp_def,
                speed: request.body.speed,
                generation: request.body.generation,
                legendary: request.body.legendary
            });

            pokemon.save().then(function() {
                response.json({success: true, message: "pokemon_added", pokemon: pokemon});
            });
        }
    });
});

app.delete('/api/v1/pokemons/:id', function(request, response) {
 Pokemon
    .where('id', request.params.id)
    .destroy({require: true})
    .then(function(pokemon) {
      response.json({success: true, message: "pokemon_destroyed"});
    }, function() {
        response.status(404).json({
            success: false,
            error: {
              message: "not_found"
            }
        });
    });
});

app.put('/api/v1/pokemons/:id', function(request, response) {
    var data = {}
    // Check if the body is empty
    if ( Object.keys(request.body).length === 0) {
        data = request.query;  // validate the url parameters
    } else {
        data = request.body;  // validate the body parameters
    }
    Joi.validate(data, pokemon_update_schema, { presence: "required" }, function(err, value) {
        // Check if the request matches the schema, the request MUST include all values
        if (err) {
            response.json(err);
        } else {
            Pokemon
                .where('id', request.params.id)
                .fetch({ require: true })
                .then(function(pokemon) {
                    pokemon.set('name', data.name);
                    return pokemon.save();
                }, function(e) {
                    response.status(404).json(
                        {
                            success: false,
                            error: {
                                message: "not_found"
                            }
                        });
                })
                .then(function(pokemon) {
                    response.json(
                        {
                            success: true,
                            message: "pokemon_updated",
                            pokemon: pokemon
                        });
                });
        }
    });
});

app.listen(8000);
