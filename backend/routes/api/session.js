const express = require('express');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models')

const router = express.Router();

router.post('/', async (req, res, next) => {
    const { credential, password } = req.body; // get cred (username/email) and password from request body

    const user = await User.login({ credential, password }); // call login static method from User model passing in cred and password

    if (!user) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = ['The provided credentials were invalid.'];
        return next(err);
    }

    await setTokenCookie(res, user); // set token cookie

    return res.json({
        user: user
    });
});

module.exports = router;
