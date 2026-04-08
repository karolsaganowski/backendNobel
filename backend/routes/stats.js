const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/categories', async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection('nobel').aggregate([
      { $unwind: "$prizes" },
      {
        $group: {
          _id: "$prizes.category",
          totalLaureates: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/countries', async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection('nobel').aggregate([
      { $match: { bornCountry: { $ne: null } } },
      {
        $group: {
          _id: "$bornCountry",
          laureateCount: { $sum: 1 }
        }
      },
      { $sort: { laureateCount: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/countries/all', async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection('nobel').aggregate([
      {
        $group: {
          _id: "$bornCountryCode",
          name: { $first: "$bornCountry" },
          laureates: {
            $addToSet: {
              firstname: "$firstname",
              surname: "$surname"
            }
          },
          laureateCount: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/years', async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection('nobel').aggregate([
      { $unwind: "$prizes" },
      {
        $group: {
          _id: "$prizes.year",
          laureateCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;