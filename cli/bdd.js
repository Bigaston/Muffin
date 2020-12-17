
require("dotenv").config()
const db = require("../models/index.js")
const fs = require("fs")
const path = require("path");

db.sequelize.sync();