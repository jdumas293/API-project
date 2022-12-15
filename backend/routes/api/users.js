const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Sign up
router.post('/', async (req, res) => {
    const { email, password, username } = req.body;
    const user = await User.signup({ email, username, password }); // call signup static method from User model

    await setTokenCookie(res, user); // if user successfully created - set token cookie

    return res.json({
        user: user
    });
});

module.exports = router;
