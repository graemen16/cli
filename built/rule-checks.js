"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTemplateInSchema = exports.tableTemplateInSchema = exports.tablesHaveIdColumn = exports.snakeCase = exports.listColInTemplates = void 0;
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
        var lookingforColumn = list.source_column_name || list.column_name;
        if (list.view_name) {
            view = view_template.find(function (view) { return view.view_name === list.view_name && view.column_name === lookingforColumn; });
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
            table = table_template.find(function (table) { return table.table_name === list.table_name && table.column_name === lookingforColumn; });
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
            errors.push("list_template: ".concat(list.list_name, " / ").concat(list.view_name, " / ").concat(list.table_name, " / ").concat(list.column_name, " is in both view_template and table_template"));
            matchedTableAndViewColumn++;
        }
        if (!view && !table) {
            errors.push("list_template: ".concat(list.list_name, " / ").concat(list.view_name, " / ").concat(list.table_name, " / ").concat(list.column_name, " (").concat(list.source_column_name, "} is not in either view_template or table_template"));
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
// tables may have UID or other columnt as ID, so check below is not valid. Not used.
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
            var column = columns.find(function (column) { return column.table_name === table.table_name && column.column_name === 'id'; });
            if (!column) {
                errors.push("table_template: ".concat(table.table_name, " does not have id column"));
            }
            else {
                var dataType = column.data_type;
                var columnDefault = column.column_default;
                if (dataType !== 'integer' || typeof columnDefault !== 'string' || !columnDefault.startsWith('nextval(')) {
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
        if (typeof table.table_name === 'string' && typeof table.column_name === 'string') {
            checked += checkTableInSchema(table.table_name);
            checked += checkColumnInSchema(table.table_name, table.column_name, table);
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
    function checkColumnInSchema(table_name, column_name, tableInTemplate) {
        var checked = 0;
        if (table_name && column_name) {
            var column = columns.find(function (column) { return column.table_name === table_name && column.column_name === column_name; });
            if (!column) {
                errors.push("table_template: ".concat(table_name, " / ").concat(column_name, " is not in schema"));
            }
            checked = 1;
            // check column data type and default value between tableInTemplate and column
            if (column && tableInTemplate) {
                /*
                const schemaType = column.data_type;
                const templateType = tableInTemplate.type;

                if (typeof schemaType !== 'string') {
                    errors.push(
                        `table_schema: ${table_name} / ${column_name} data_type is not a string`
                    );
                    return checked;
                }
                if (typeof templateType !== 'string') {
                    errors.push(
                        `table_template: ${table_name} / ${column_name} data_type is not a string`
                    );
                    return checked;
                }
                const templateTypeInSchmaFormat = () => {
                    if (templateType.startsWith('varchar')) {
                        return 'character varying';
                    }
                    if (templateType.startsWith('int')) {
                        return 'integer';
                    }
                    if (templateType.startsWith('serial')) {
                        return 'integer';
                    }
                    switch (templateType) {
                        case 'text':
                            return 'text';
                        case 'timestamp':
                            return 'timestamp without time zone';
                        case 'timestamptz':
                            return 'timestamp with time zone';
                        case 'boolean':
                            return 'boolean';
                        default:
                            return templateType;
                    }
                };

                if (schemaType !== templateTypeInSchmaFormat()) {
                    errors.push(
                        `table_template: ${table_name} / ${column_name} data_type is different between table_template and schema`
                    );
                }

                // TODO check default value

                if (schemaType === 'charachter varying') {
                    // find length of varchar in template from format varchar(255)
                    const templateVarcharLength = parseInt(templateType.match(/\d+/)[0]);
                    const schemaVarcharLength: number | null =
                        typeof column.character_maximum_length === 'number'
                            ? column.character_maximum_length
                            : null;

                    if (
                        schemaVarcharLength &&
                        schemaVarcharLength < templateVarcharLength
                    ) {
                        errors.push(
                            `schema: ${table_name} / ${column_name} character_maximum_length is too short`
                        );
                    }
                }
                */
                // check nullability
                var schemaNullable = column.is_nullable === 'YES';
                var templateNullable = !tableInTemplate.not_null;
                if (schemaNullable !== templateNullable) {
                    errors.push("schema: ".concat(table_name, " / ").concat(column_name, " is_nullable is different between table_template (").concat(templateNullable, ") and schema (").concat(column.is_nullable, ")"));
                }
            }
        }
        return checked;
    }
}
exports.tableTemplateInSchema = tableTemplateInSchema;
// check that each table and column in table_template has corresponding table and column in schema
function listTemplateInSchema(_a) {
    var tables = _a.tables, columns = _a.columns, list_template = _a.list_template;
    var test = 'Table/view and column in list_template are in schema';
    var status = 'OK';
    var errors = [];
    var checked = 0;
    list_template.forEach(function (list) {
        var sourceTableName = list.table_name || list.view_name;
        if (typeof sourceTableName === 'string' && typeof list.column_name === 'string') {
            checked += checkTableInSchema(sourceTableName);
            checked += checkColumnInSchema(list.column_name, list);
        }
    });
    if (errors.length > 0) {
        status = 'ERROR';
    }
    console.log("Table and column in list_template are in schema: checked ".concat(checked));
    return { test: test, status: status, errors: errors };
    function checkTableInSchema(table_name) {
        var checked = 0;
        if (table_name) {
            var table = tables.find(function (table) { return table.table_name === table_name; });
            if (!table) {
                errors.push("list_template: ".concat(table_name, " is not in schema"));
            }
            checked = 1;
        }
        return checked;
    }
    function checkColumnInSchema(column_name, list) {
        var checked = 0;
        if (list.list_name && column_name) {
            var column = columns.find(function (column) { return column.table_name === list.list_name && column.column_name === column_name; });
            if (!column) {
                errors.push("list_template: ".concat(list.list_name, " / ").concat(column_name, " is not in schema"));
            }
            checked = 1;
        }
        return checked;
    }
}
exports.listTemplateInSchema = listTemplateInSchema;
