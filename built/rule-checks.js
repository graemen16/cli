"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableTemplateInSchema = exports.tablesHaveIdColumn = exports.snakeCase = exports.listColInTemplates = void 0;
// check columns in list_template are in either view_template or table_template
function listColInTemplates(_a) {
    var table_template = _a.table_template, view_template = _a.view_template, list_template = _a.list_template;
    var test = 'List Columns in Templates';
    var status = 'OK';
    var errors = [];
    var matchedTableColumn = 0;
    var matchedViewColumn = 0;
    var unMatchedListColumn = 0;
    var matchedTableAndViewColumn = 0;
    list_template.forEach(function (list) {
        /*
        console.log(
            'list_template view / table / column:' +
                list.view_name +
                ' / ' +
                list.table_name +
                ' / ' +
                list.column_name
        );
        */
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
            errors.push("list_template: ".concat(list.view_name, " / ").concat(list.table_name, " / ").concat(list.column_name, " is in both view_template and table_template"));
            matchedTableAndViewColumn++;
        }
        if (!view && !table) {
            errors.push("list_template: ".concat(list.view_name, " / ").concat(list.table_name, " / ").concat(list.column_name, " is not in either view_template or table_template"));
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
    if (errors.length > 0) {
        status = 'ERROR';
    }
    return { test: test, status: status, errors: errors };
}
exports.listColInTemplates = listColInTemplates;
// check if table_name, column_name, view_name are in snake_case
function snakeCase(_a) {
    var table_template = _a.table_template, view_template = _a.view_template, list_template = _a.list_template;
    var test = 'Table, View and List names are in snake_case';
    var status = 'OK';
    var errors = [];
    var checked = 0;
    table_template.forEach(function (table) {
        checked += checkFieldSnakeCase(table.table_name, 'table_template');
        checked += checkFieldSnakeCase(table.column_name, 'table_template');
    });
    view_template.forEach(function (view) {
        checked += checkFieldSnakeCase(view.view_name, 'view_template');
        checked += checkFieldSnakeCase(view.column_name, 'view_template');
    });
    list_template.forEach(function (list) {
        checked += checkFieldSnakeCase(list.view_name, 'list_template');
        checked += checkFieldSnakeCase(list.table_name, 'list_template');
        checked += checkFieldSnakeCase(list.column_name, 'list_template');
    });
    if (errors.length > 0) {
        status = 'ERROR';
    }
    console.log("Snake case checked ".concat(checked, " fields"));
    return { test: test, status: status, errors: errors };
    function checkFieldSnakeCase(check_value, check_table) {
        var checked = 0;
        if (check_value) {
            if (typeof check_value !== 'string') {
                errors.push("".concat(check_table, ": ").concat(check_value, " is not a string"));
            }
            else if (!isSnakeCase(check_value)) {
                errors.push("".concat(check_table, ": ").concat(check_value, " is not in snake_case"));
            }
            checked = 1;
        }
        return checked;
    }
}
exports.snakeCase = snakeCase;
function isSnakeCase(str) {
    return /^[a-z]+(?:_[a-z0-9]+)*$/g.test(str);
}
function tablesHaveIdColumn(_a) {
    var tables = _a.tables, columns = _a.columns;
    var test = 'Tables have id column';
    var status = 'OK';
    var errors = [];
    var checked = 0;
    tables.forEach(function (table) {
        if (table.table_name && table.table_type === 'BASE TABLE') {
            checked++;
            // check if there is a column with table_name and column_name = id
            var column = columns.find(function (column) {
                return column.table_name === table.table_name && column.column_name === 'id';
            });
            if (!column) {
                errors.push("table_template: ".concat(table.table_name, " does not have id column"));
            }
            else {
                var dataType = column.data_type;
                var columnDefault = column.column_default;
                if (dataType !== 'integer' ||
                    typeof columnDefault !== 'string' ||
                    !columnDefault.startsWith('nextval(')) {
                    errors.push("table_template: ".concat(table.table_name, " id column is not auto serial"));
                }
            }
        }
    });
    if (errors.length > 0) {
        status = 'ERROR';
    }
    console.log("Tables have id: checked ".concat(checked, " tables"));
    return { test: test, status: status, errors: errors };
}
exports.tablesHaveIdColumn = tablesHaveIdColumn;
// check that each table and column in table_template has corresponding table and column in schema
function tableTemplateInSchema(_a) {
    var tables = _a.tables, columns = _a.columns, table_template = _a.table_template;
    var test = 'Table and column in table_template are in schema';
    var status = 'OK';
    var errors = [];
    var checked = 0;
    table_template.forEach(function (table) {
        if (typeof table.table_name === 'string' &&
            typeof table.column_name === 'string') {
            checked += checkTableInSchema(table.table_name);
            checked += checkColumnInSchema(table.table_name, table.column_name);
        }
    });
    if (errors.length > 0) {
        status = 'ERROR';
    }
    console.log("Table and column in table_template are in schema: checked ".concat(checked));
    return { test: test, status: status, errors: errors };
    function checkTableInSchema(table_name) {
        var checked = 0;
        if (table_name) {
            var table = tables.find(function (table) { return table.table_name === table_name; });
            if (!table) {
                errors.push("table_template: ".concat(table_name, " is not in schema"));
            }
            checked = 1;
        }
        return checked;
    }
    function checkColumnInSchema(table_name, column_name) {
        var checked = 0;
        if (table_name && column_name) {
            var column = columns.find(function (column) {
                return column.table_name === table_name && column.column_name === column_name;
            });
            if (!column) {
                errors.push("table_template: ".concat(table_name, " / ").concat(column_name, " is not in schema"));
            }
            checked = 1;
            //TODO check column data type and default value
        }
        return checked;
    }
}
exports.tableTemplateInSchema = tableTemplateInSchema;
