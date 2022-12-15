'use strict';
const { Model, Validator } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafeObject() {
      const { id, username, email } = this; // context will be the user instance
      return { id, username, email };
    }
    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString()); // compare password and hashed password
    }
    static getCurrentUserById(id) {
      return User.scope("currentUser").findByPk(id);
    }
    static async login({ credential, password }) {
      const { Op } = require('sequelize');
      const user = await User.scope('loginUser').findOne({ // find a user with a matching username or email credential
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
      if (user && user.validatePassword(password)) { // if user is found - validate the password
        return await User.scope('currentUser').findByPk(user.id); // if password is valid - return the user
      }
    }
    static async signup({ username, email, password }) {
      const hashedPassword = bcrypt.hashSync(password); // hash the password
      const user = await User.create({ // create user with given username, email, and newly hashed password
        username,
        email,
        hashedPassword
      });
      return await User.scope('currentUser').findByPk(user.id); // return created user using current user scope
    }
    static associate(models) {
      // define association here
    }
  };

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error("Cannot be an email.");
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    // These scopes help protect sensitive user info that should not be exposed to other users
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
      }
    },
    scopes: {
      currentUser: {
        attributes: { exclude: ["hashedPassword"] }
      },
      loginUser: {
        attributes: {}
      }
    }
  });
  return User;
};
