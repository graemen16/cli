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
var queryList_1 = require("./queryList");
var rule_checks_1 = require("./rule-checks");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, list_template, view_template, table_template, results, _b, tables, columns;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Check database');
                    return [4 /*yield*/, (0, queryList_1.logTemplates)()];
                case 1:
                    _a = _c.sent(), list_template = _a.list_template, view_template = _a.view_template, table_template = _a.table_template;
                    results = [];
                    return [4 /*yield*/, (0, queryList_1.logSchema)()];
                case 2:
                    _b = _c.sent(), tables = _b.tables, columns = _b.columns;
                    true && results.push((0, rule_checks_1.listColInTemplates)({ list_template: list_template, view_template: view_template, table_template: table_template }));
                    true && results.push((0, rule_checks_1.snakeCase)({ list_template: list_template, view_template: view_template, table_template: table_template }));
                    false && results.push((0, rule_checks_1.tablesHaveIdColumn)({ tables: tables, columns: columns }));
                    results.push((0, rule_checks_1.tableTemplateInSchema)({ tables: tables, columns: columns, table_template: table_template }));
                    results.push((0, rule_checks_1.listTemplateInSchema)({ tables: tables, columns: columns, list_template: list_template }));
                    console.log('Results:');
                    console.log(results);
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = main;
main();
