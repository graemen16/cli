"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertForm = exports.queryViewData = exports.queryViewColumns = exports.querySchema = void 0;
//import { unknownInputs } from "@/lib/form-utils"
require("dotenv/config");
var pg_1 = require("pg");
// pools will use environment variables
// for connection information
require('console-stamp')(console);
var pgConfig = {
    database: process.env['POSTGRES_DATABASE'],
    host: process.env['POSTGRES_HOST'],
    user: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
    port: Number.parseInt(process.env['POSTGRES_PORT'] || '0'),
    max: 10,
    ssl: true,
};
var querySchema = function (mode) { return __awaiter(void 0, void 0, void 0, function () {
    var pool, table, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pool = new pg_1.Pool(pgConfig);
                table = null;
                switch (mode) {
                    case 'tables':
                        table = 'gv_dev.schema_tables';
                        break;
                    case 'columns':
                        table = 'gv_dev.schema_columns';
                        break;
                    case 'table_template':
                        table = 'gv_dev.table_template';
                        break;
                    case 'view_template':
                        table = 'gv_dev.view_template';
                        break;
                    case 'list_template':
                        table = 'gv_dev.list_template';
                        break;
                    default:
                        console.log('querySchema: unknown mode ' + mode);
                        return [2 /*return*/, null];
                }
                return [4 /*yield*/, pool.query('SELECT * FROM ' + table)];
            case 1:
                res = _a.sent();
                //console.log(' queryMasterTable : ' + res.rows[0]);
                return [4 /*yield*/, pool.end()];
            case 2:
                //console.log(' queryMasterTable : ' + res.rows[0]);
                _a.sent();
                return [2 /*return*/, res];
        }
    });
}); };
exports.querySchema = querySchema;
function queryViewColumns(viewList) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, sql, values, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = new pg_1.Pool(pgConfig);
                    sql = "select \nvl.column_name\n, vl.list_order\n, coalesce (mt.type, mv.type) as type\n, coalesce (vl.view_label,mt.column_label,mv.column_label  )  as label\n, vl.crud\n, vl.display_for \n, vl.form_type \n, mt.not_null \n, mt.source_list \n, mt.source_column\n, mt.min_length \n, mt.max_length \n, mt.min_value \n, mt.max_value \n, mt.\"schema\" \n, mt.table_name \n  from gv_dev.view_list vl \n  left join gv_dev.master_table mt on mt.table_name = vl.table_name and mt.column_name =vl.column_name \n  left join gv_dev.master_view mv on mv.view_name =vl.view_name and mv.column_name =vl.column_name \n  where vl.list_name = $1\n  order by vl.list_order";
                    values = [viewList];
                    return [4 /*yield*/, pool.query(sql, values)];
                case 1:
                    res = _a.sent();
                    console.log(' queryViewList row 0: ' + res.rows[0]);
                    return [4 /*yield*/, pool.end()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.queryViewColumns = queryViewColumns;
// query view data based on a view or table name.
function queryViewData(_a) {
    var viewName = _a.viewName, itemId = _a.itemId, pageIndex = _a.pageIndex, pageSize = _a.pageSize;
    return __awaiter(this, void 0, void 0, function () {
        var paramIndex, pool, sql, values, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    paramIndex = 1;
                    pool = new pg_1.Pool(pgConfig);
                    sql = "select * from gv.".concat(viewName);
                    values = [];
                    if (itemId) {
                        sql += " \nwhere id = $" + paramIndex++; // note requires query to include id column!
                        values.push(itemId);
                    }
                    if (pageIndex && pageSize) {
                        sql += " \nlimit $" + paramIndex++ + " offset $" + paramIndex++;
                        values.push(pageSize, (pageIndex - 1) * pageSize);
                    }
                    console.log(' queryViewData: ' + sql + ' ' + values);
                    return [4 /*yield*/, pool.query(sql, values)];
                case 1:
                    res = _b.sent();
                    //console.log(res.rows[0])
                    return [4 /*yield*/, pool.end()];
                case 2:
                    //console.log(res.rows[0])
                    _b.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.queryViewData = queryViewData;
/*
// clients will also use environment variables
// for connection information
const client = new Client()
await client.connect()

const res = await client.query("SELECT NOW()")
await client.end()
*/
function upsertForm(columns, data) {
    return __awaiter(this, void 0, void 0, function () {
        function insertResult() {
            return __awaiter(this, void 0, void 0, function () {
                var insertRes;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            insertRes = [];
                            return [4 /*yield*/, Promise.all(targetTables.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                                    var res, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!updateMode) return [3 /*break*/, 2];
                                                return [4 /*yield*/, updateTable(table)];
                                            case 1:
                                                _a = _b.sent();
                                                return [3 /*break*/, 4];
                                            case 2: return [4 /*yield*/, insertTable(table)];
                                            case 3:
                                                _a = _b.sent();
                                                _b.label = 4;
                                            case 4:
                                                res = _a;
                                                console.log('table res: ', res);
                                                insertRes.push(res);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, insertRes];
                    }
                });
            });
        }
        function insertTable(table) {
            return __awaiter(this, void 0, void 0, function () {
                var statementIndex, values, sql, columnsSql, valuesSql, res, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            statementIndex = 1;
                            values = [];
                            sql = "insert into ".concat(table, " \n");
                            columnsSql = '(';
                            valuesSql = 'values (';
                            keys.forEach(function (key) {
                                var column = columns.find(function (column) { return column.column_name === key; });
                                if (column && column.column_name !== 'id') {
                                    columnsSql += "".concat(column.column_name, ", ");
                                    valuesSql += "$" + statementIndex++ + ", ";
                                    values.push(data[key]);
                                }
                            });
                            columnsSql = columnsSql.slice(0, -2); // remove last comma
                            columnsSql += ')\n';
                            valuesSql = valuesSql.slice(0, -2); // remove last comma
                            valuesSql += ')\n';
                            sql += columnsSql + valuesSql;
                            sql += "returning id";
                            console.log('insert: \n' + sql + ' ' + values);
                            return [4 /*yield*/, pool.query(sql, values)];
                        case 1:
                            res = _a.sent();
                            response = { table: table, insertedId: res.rows[0].id };
                            return [2 /*return*/, response];
                    }
                });
            });
        }
        function updateTable(table) {
            return __awaiter(this, void 0, void 0, function () {
                var statementIndex, values, sql, res, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            statementIndex = 1;
                            values = [];
                            sql = "update ".concat(table, " set \n");
                            keys.forEach(function (key) {
                                var column = columns.find(function (column) { return column.column_name === key; });
                                if (column) {
                                    sql += "".concat(column.column_name, " = $") + statementIndex++ + ", \n";
                                    values.push(data[key]);
                                }
                            });
                            sql = sql.slice(0, -3); // remove last comma
                            sql += "\nwhere id = $" + statementIndex++ + '\n'; // note requires query to include id column!
                            values.push(data.id);
                            console.log('update: ' + sql + ' ' + values);
                            return [4 /*yield*/, pool.query(sql, values)];
                        case 1:
                            res = _a.sent();
                            response = { table: table, rowCount: res.rowCount };
                            return [2 /*return*/, response];
                    }
                });
            });
        }
        var keys, targetTables, pool, updateMode, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // don't include validation, but pass back any database errors
                    // which table are we upserting to?
                    console.log('upsertForm');
                    keys = Object.keys(data);
                    targetTables = [];
                    keys.forEach(function (key) {
                        var column = columns.find(function (column) { return column.column_name === key; });
                        if (!column) {
                            throw new Error('No column for key ' + key);
                        }
                        // note:  want unique values only. Couldn't use set as it doesn't support mapping
                        var tableName = "".concat(column.schema, ".").concat(column.table_name);
                        if (!targetTables.includes(tableName)) {
                            targetTables.push(tableName);
                        }
                    });
                    console.log('targetTables: ', targetTables);
                    pool = new pg_1.Pool(pgConfig);
                    updateMode = data.id ? data.id > 0 : false;
                    return [4 /*yield*/, insertResult()];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, pool.end()];
                case 2:
                    _a.sent();
                    console.log('returnValue: ' + response);
                    return [2 /*return*/, response]; // TODO - need to return the id of the inserted row - this returns before the insert is complete!
            }
        });
    });
}
exports.upsertForm = upsertForm;
