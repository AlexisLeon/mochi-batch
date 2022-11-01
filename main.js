const axios = require('axios');

// A list of words
const words = require('./words');

const MOCHI_API = "https://app.mochi.cards/api";
const MOCHI_API_KEY = "mochi_personal_api_key";
const BATCH_SIZE = 50;

const frenchVocabTemplateID = "template_id";
const decks = {
  testDeck: '',
  french: {
    deck: '',
    template: '',

    common: {
      deck: 'deck_id',
      template: frenchVocabTemplateID,
    },

    vocab: {
      deck: 'deck_id',
      template: frenchVocabTemplateID,
    },
  },
};

const cli = axios.create({
  baseUrl: MOCHI_API,
  auth: {
    username: MOCHI_API_KEY,
    password: '',
  },
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * @param {string} name The name of the card
 * @return {Card} card object
 */
async function createMochiCard(word, deckID, templateID) {
  console.log(`mochi:create_card:started ${word}`);

  const {data} = await cli.post(`${MOCHI_API}/cards/`, {
    "content": "",
    "deck-id": deckID,
    "template-id": templateID,
    "fields": {
      "name": {
        "id": "name",
        "value": word
      }
    },
    "review-reverse?": true
  })

  console.log(`mochi:create_card:created ${word} deck_id=${card['deck-id']} template_id=${card['template-id']} id=${card.id}`);

  return data;
}

function logAxiosError(error) {
  if (error.response) {
      console.log('request executed with errors')
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log('request executed without response')
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      console.log('request config failed');
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
}

async function main() {
  let allWords = [...words];

  // while there are words left
  while (allWords.length) {
    const wordBatch = words
      .splice(0, BATCH_SIZE)
      .map(word => createMochiCard(
        word,
        decks.french.common.deck,
        decks.french.common.template
      ))

    const values = await Promise.allSettled(wordBatch)

    // report back to the user
    let fulfilled = 0;

    for(let task of values) {
      if (task.status === "rejected") {
        console.error(`mochi:create_card:failed ${word}`);
        logAxiosError(err);
        break;
      } else if (task.status == "fulfilled") {
        fulfilled +=1;
      }
    }

    console.error(`mochi:create_card:created Successfully ${fulfilled} cards`);
  }
}

main();
