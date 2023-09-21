"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var process_1 = require("process");
function dbFileCheck() {
    if (!fs.existsSync('db.json')) {
        console.log('Database is Empty. Create some data!');
        (0, process_1.exit)(1);
    }
}
exports.default = dbFileCheck;
