require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// get all restaurants
app.get('/api/v1/restaurants', async (req, res) => {
    try {
        const results = await db.query(
            "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
        );

        res.status(200).json({
            status: 'success',
            results: results.rows.length,
            data: {
                restaurants: results.rows
            },
        });
    } catch (e) {
        console.log(e);
    }
});

// get individual restaurant
app.get('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const restaurant = await db.query(
            "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1",
      [req.params.id], 
            [req.params.id]
        );

        const reviews = await db.query(
            "select * from reviews where restaurant_id = $1", 
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                restaurants: restaurant.rows[0],
                reviews: reviews.rows
            }
        });
    } catch (e) {
        console.log(e);
    }
});

// create a restaurant
app.post('/api/v1/restaurants', async (req, res) => {
    try {
        const result = await db.query(
            'insert into restaurants (name, location, price_range) values($1, $2, $3) returning *',
            [req.body.name, req.body.location, req.body.price_range]
        );
        res.status(201).json({
            status: 'success',
            data: {
                restaurants: result.rows[0]
            }
        }); 
    } catch (e) {
        console.log(e);
    }
});

// update restaurant
app.put('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const result = await db.query(
            'update restaurants set name=$1, location=$2, price_range=$3 where id=$4 returning *',
            [req.body.name, req.body.location, req.body.price_range, req.params.id]
        );
        res.status(200).json({
            status: 'success',
            data: {
                restaurants: result.rows[0]
            }
        });
    } catch (e) {
        console.log(e);
    }
});

// delete restaurant
app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const result = await db.query(
            'delete from restaurants where restaurants.id=$1',
            [req.params.id]
        );

        res.status(204).json({
            status: 'success'
        });
    } catch (e) {
        console.log(e);
    }
});

// add review
app.post('/api/v1/restaurants/:id/addReview', async (req, res) => {
    try {
        const result = await db.query(
            'insert into reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *;',
            [req.params.id, req.body.name, req.body.review, req.body.rating]
        );

        res.status(201).json({
            status: 'success',
            restaurants: result.rows[0]
        })
    } catch (e) {
        console.log(e);
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});