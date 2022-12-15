const express = require('express');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Log in
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

// Log out
router.delete('/', (_req, res) => {
    res.clearCookie('token'); // remove token cookie from response
    return res.json({ message: 'success' });
});

// Restore session user
router.get('/', restoreUser, (req, res) => {
    const { user } = req;
    if (user) { // if there is a session user - return the session user as JSON
        return res.json({
            user: user.toSafeObject()
        });
    } else return res.json({ user: null }); // if there not a session user - return JSON with an empty object
});

module.exports = router;
