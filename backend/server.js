const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors')
require('dotenv').config()

const app = express();
const client = new MongoClient(process.env.MONGO_URI)
 
async function startServer() {
  await client.connect();
  console.log('Połączono z MongoDB');

  const db = client.db('testowy');
  const coll = db.collection('nobel');

  app.use(cors({
    origin: 'http://localhost:5173' 
  }));

  app.get('/api/laureates', async (req, res) => {
  const { category, country, search, yearFrom, yearTo } = req.query;

  console.log(category, country, search, yearFrom, yearTo);

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

    const sort = { born: -1 };

    const result = await coll.find(filter).sort(sort).toArray();

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

  app.get('/api/laureates/:id', async (req, res) => {
    try {
      const id = req.params.id;

      const filter = { id: id };

      const result = await coll.find(filter).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak noblisty z id ${id}`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.get('/api/laureates/country/:country', async (req, res) => {
    try {
      const country = req.params.country;

      const filter = { bornCountryCode: country };

      const result = await coll.find(filter).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak noblisty z kraju ${id}`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.get('/api/stats/categories', async (req, res) => {
    try {
      const Pipeline = [
        {
          $unwind: "$prizes"
        },
        {
          $group: {
            _id: "$prizes.category",
            totalLaureates: {
              $sum: 1
            }
          }
        }
      ]

      const result = await coll.aggregate(Pipeline).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak kategorii`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.get('/api/stats/countries', async (req, res) => {
    try {
      const Pipeline = [
      {
        $match: {
          bornCountry: {
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: "$bornCountry",
          laureateCount: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          laureateCount: -1
        }
      },
      {
        $limit: 10
      }
    ]

      const result = await coll.aggregate(Pipeline).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak krajów`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.get('/api/stats/countries/all', async (req, res) => {
    try {
      const Pipeline = [
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
]

      const result = await coll.aggregate(Pipeline).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak krajów`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.get('/api/stats/years', async (req, res) => {
    try {
      const Pipeline = [
        {
          $unwind: "$prizes"
        },
        {
          $group: {
            _id: "$prizes.year",
            laureateCount: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]

      const result = await coll.aggregate(Pipeline).toArray();

      if (result.length === 0) {
        return res.status(404).json({
          message: `Brak noblistów`
        });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  })

  app.listen(process.env.PORT, () => {
    console.log(`Serwer działa na http://localhost:${process.env.PORT}`);
  });
}

startServer().catch(console.error);