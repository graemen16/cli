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
exports.checkListTemplate = exports.logTemplates = exports.logSchema = exports.queryList = void 0;
var db_node_pg_1 = require("./db/db-node-pg");
function queryList() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_node_pg_1.queryViewData)({ viewName: 'enquiry_extract' })];
                case 1:
                    response = _a.sent();
                    console.log('response :' + JSON.stringify, response.rows);
                    return [2 /*return*/];
            }
        });
    });
}
exports.queryList = queryList;
function logSchema() {
    return __awaiter(this, void 0, void 0, function () {
        var response, tables, columns;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_node_pg_1.querySchema)('tables')];
                case 1:
                    response = _a.sent();
                    tables = response.rows;
                    return [4 /*yield*/, (0, db_node_pg_1.querySchema)('columns')];
                case 2:
                    //console.log('tables :' + JSON.stringify, response.rows);
                    response = _a.sent();
                    columns = response.rows;
                    //console.log('columns :' + JSON.stringify, response.rows);
                    return [2 /*return*/, { tables: tables, columns: columns }];
            }
        });
    });
}
exports.logSchema = logSchema;
function logTemplates() {
    return __awaiter(this, void 0, void 0, function () {
        var response, table_template, view_template, list_template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_node_pg_1.querySchema)('table_template')];
                case 1:
                    response = _a.sent();
                    table_template = response.rows;
                    return [4 /*yield*/, (0, db_node_pg_1.querySchema)('view_template')];
                case 2:
                    //console.log('table_template :' + JSON.stringify, response.rows);
                    response = _a.sent();
                    view_template = response.rows;
                    return [4 /*yield*/, (0, db_node_pg_1.querySchema)('list_template')];
                case 3:
                    //console.log('view_template :' + JSON.stringify, response.rows);
                    response = _a.sent();
                    list_template = response.rows;
                    //console.log('list_template :' + JSON.stringify, response.rows);
                    return [2 /*return*/, { table_template: table_template, view_template: view_template, list_template: list_template }];
            }
        });
    });
}
exports.logTemplates = logTemplates;
function checkListTemplate() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, list_template, view_template, table_template, matchedTableColumn, matchedViewColumn, unMatchedListColumn, matchedTableAndViewColumn;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, logTemplates()];
                case 1:
                    _a = _b.sent(), list_template = _a.list_template, view_template = _a.view_template, table_template = _a.table_template;
                    matchedTableColumn = 0;
                    matchedViewColumn = 0;
                    unMatchedListColumn = 0;
                    matchedTableAndViewColumn = 0;
                    list_template.forEach(function (list) {
                        console.log('list_template view / table / column:' +
                            list.view_name +
                            ' / ' +
                            list.table_name +
                            ' / ' +
                            list.column_name);
                        var view = null;
                        var table = null;
                        if (list.view_name) {
                            view = view_template.find(function (view) {
                                return view.view_name === list.view_name &&
                                    view.column_name === list.column_name;
                            });
                            if (view) {
                                matchedViewColumn++;
                            }
                            /*
                            console.log(
                                view
                                    ? 'view_template :' + JSON.stringify(view)
                                    : 'view_template not found'
                            );
                            */
                        }
                        if (list.table_name) {
                            table = table_template.find(function (table) {
                                return table.table_name === list.table_name &&
                                    table.column_name === list.column_name;
                            });
                            if (table) {
                                matchedTableColumn++;
                            }
                            /*
                            console.log(
                                table
                                    ? 'table_template :' + JSON.stringify(table)
                                    : 'table_template not found'
                            );
                            */
                        }
                        if (view && table) {
                            matchedTableAndViewColumn++;
                        }
                        if (!view && !table) {
                            unMatchedListColumn++;
                        }
                        /*
                        const view = view_template.find(
                            (view) => view.view_name === list.view_name
                        );
                
                        console.log('view_template :' + JSON.stringify(view));
                        const table = table_template.find(
                            (table) => table.table_name === view.table_name
                        );
                        console.log('table_template :' + JSON.stringify(table));
                        */
                    });
                    console.log("Check view list\n:matchedTableColumn: ".concat(matchedTableColumn, " \nmatchedViewColumn: ").concat(matchedViewColumn, " \nunMatchedListColumn: ").concat(unMatchedListColumn, " \nmatchedTableAndViewColumn: ").concat(matchedTableAndViewColumn));
                    return [2 /*return*/];
            }
        });
    });
}
exports.checkListTemplate = checkListTemplate;
//checkListTemplate();
