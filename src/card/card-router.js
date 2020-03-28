const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { cards, lists } = require('../store');

const cardRouter = express.Router();
const bodyParser = express.json();

cardRouter
  .route('/card')
  .get((req, res) => {
    res
      .json(cards);
  })
  .post(bodyParser, (req, res) => {
    const { title, content } = req.body;

    if(!title) {
      logger.error('title not provided');
      return res
        .status(400)
        .send('title not provided');
    }

    if(!content) {
      logger.error('content not provided');
      return res
        .status(400)
        .send('content not provided');
    }

    const id = uuid();
    
    const card = {
      id,
      title,
      content
    };

    cards.push(card);
    
    logger.info(`Card with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/card/${id}`)
      .send({ id });
  });

cardRouter
  .route('/card/:id')
  .get((req, res) => {
    const { id } = req.params;
    const index = cards.findIndex(card => card.id === Number(id));

    if(index === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('card with supplied id could not be found');
    }

    res
      .json(cards[index]);
  })
  .delete((req, res) => {
    const { id } = req.params;

    // eslint-disable-next-line eqeqeq
    const cardIndex = cards.findIndex(c => c.id == id);

    if (cardIndex === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }

    //remove card from lists
    //assume cardIds are not duplicated in the cardIds array
    lists.forEach(list => {
      const cardIds = list.cardIds.filter(cid => cid !== id);
      list.cardIds = cardIds;
    });

    cards.splice(cardIndex, 1);

    logger.info(`Card with id ${id} deleted.`);

    res
      .status(204)
      .end();
  });

module.exports = cardRouter;