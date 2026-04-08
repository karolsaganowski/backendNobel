const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', async (req, res) => {
  const { category, country, search, yearFrom, yearTo } = req.query;

  try {
    const filter = {};

    if (category || yearFrom || yearTo) {
      filter["prizes"] = {
        $elemMatch: {
          ...(category && { category }),
          ...((yearFrom || yearTo) && {
            year: {
              ...(yearFrom && { $gte: String(yearFrom) }),
              ...(yearTo && { $lte: String(yearTo) })
            }
          })
        }
      };
    }

    if (country) {
      filter["bornCountry"] = country;
    }

    if (search) {
      filter["surname"] = { $regex: search, $options: "i" };
    }

    const db = getDB();

    const result = await db
      .collection('nobel')
      .find(filter)
      .sort({ born: -1 })
      .toArray();

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection('nobel')
      .find({ id: req.params.id })
      .toArray();

    if (result.length === 0) {
      return res.status(404).json({
        message: `Brak noblisty z id ${req.params.id}`
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/country/:country', async (req, res) => {
  try {
    const db = getDB();

    const result = await db
      .collection('nobel')
      .find({ bornCountryCode: req.params.country })
      .toArray();

    if (result.length === 0) {
      return res.status(404).json({
        message: `Brak noblistów z kraju ${req.params.country}`
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;