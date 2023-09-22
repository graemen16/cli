import { type } from 'os';
import { unknownInputs } from './db/db-node-pg';

// check columns in list_template are in either view_template or table_template
export function listColInTemplates({
	table_template,
	view_template,
	list_template,
}: {
	table_template: unknownInputs[];
	view_template: unknownInputs[];
	list_template: unknownInputs[];
}) {
	const test = 'List Columns in Templates';
	let status = 'OK';
	let errors = [];
	let matchedTableColumn = 0;
	let matchedViewColumn = 0;
	let unMatchedListColumn = 0;
	let matchedTableAndViewColumn = 0;

	list_template.forEach((list) => {
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
		let view = null;
		let table = null;
		if (list.view_name) {
			view = view_template.find(
				(view) =>
					view.view_name === list.view_name &&
					view.column_name === list.column_name
			);
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
			table = table_template.find(
				(table) =>
					table.table_name === list.table_name &&
					table.column_name === list.column_name
			);
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
			errors.push(
				`list_template: ${list.view_name} / ${list.table_name} / ${list.column_name} is in both view_template and table_template`
			);
			matchedTableAndViewColumn++;
		}
		if (!view && !table) {
			errors.push(
				`list_template: ${list.view_name} / ${list.table_name} / ${list.column_name} is not in either view_template or table_template`
			);
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
	console.log(
		`Check view list\n:matchedTableColumn: ${matchedTableColumn} \nmatchedViewColumn: ${matchedViewColumn} \nunMatchedListColumn: ${unMatchedListColumn} \nmatchedTableAndViewColumn: ${matchedTableAndViewColumn}`
	);
	if (errors.length > 0) {
		status = 'ERROR';
	}
	return { test, status, errors };
}

// check if table_name, column_name, view_name are in snake_case
export function snakeCase({
	table_template,
	view_template,
	list_template,
}: {
	table_template: unknownInputs[];
	view_template: unknownInputs[];
	list_template: unknownInputs[];
}) {
	const test = 'Table, View and List names are in snake_case';
	let status = 'OK';
	let errors = [];
	let checked = 0;
	table_template.forEach((table) => {
		checked += checkFieldSnakeCase(table.table_name, 'table_template');

		checked += checkFieldSnakeCase(table.column_name, 'table_template');
	});
	view_template.forEach((view) => {
		checked += checkFieldSnakeCase(view.view_name, 'view_template');
		checked += checkFieldSnakeCase(view.column_name, 'view_template');
	});
	list_template.forEach((list) => {
		checked += checkFieldSnakeCase(list.view_name, 'list_template');
		checked += checkFieldSnakeCase(list.table_name, 'list_template');
		checked += checkFieldSnakeCase(list.column_name, 'list_template');
	});
	if (errors.length > 0) {
		status = 'ERROR';
	}
	console.log(`Snake case checked ${checked} fields`);
	return { test, status, errors };

	function checkFieldSnakeCase(check_value: unknown, check_table: string) {
		let checked = 0;
		if (check_value) {
			if (typeof check_value !== 'string') {
				errors.push(`${check_table}: ${check_value} is not a string`);
			} else if (!isSnakeCase(check_value)) {
				errors.push(`${check_table}: ${check_value} is not in snake_case`);
			}
			checked = 1;
		}
		return checked;
	}
}
function isSnakeCase(str: string) {
	return /^[a-z]+(?:_[a-z0-9]+)*$/g.test(str);
}

export function tablesHaveIdColumn({
	tables,
	columns,
}: {
	tables: unknownInputs[];
	columns: unknownInputs[];
}) {
	const test = 'Tables have id column';
	let status = 'OK';
	let errors = [];
	let checked = 0;

	tables.forEach((table) => {
		if (table.table_name && table.table_type === 'BASE TABLE') {
			checked++;
			// check if there is a column with table_name and column_name = id
			const column = columns.find(
				(column) =>
					column.table_name === table.table_name && column.column_name === 'id'
			);
			if (!column) {
				errors.push(
					`table_template: ${table.table_name} does not have id column`
				);
			} else {
				const dataType = column.data_type;
				const columnDefault = column.column_default;
				if (
					dataType !== 'integer' ||
					typeof columnDefault !== 'string' ||
					!columnDefault.startsWith('nextval(')
				) {
					errors.push(
						`table_template: ${table.table_name} id column is not auto serial`
					);
				}
			}
		}
	});
	if (errors.length > 0) {
		status = 'ERROR';
	}
	console.log(`Tables have id: checked ${checked} tables`);
	return { test, status, errors };
}

// check that each table and column in table_template has corresponding table and column in schema
export function tableTemplateInSchema({
	tables,
	columns,
	table_template,
}: {
	tables: unknownInputs[];
	columns: unknownInputs[];
	table_template: unknownInputs[];
}) {
	const test = 'Table and column in table_template are in schema';
	let status = 'OK';
	let errors = [];
	let checked = 0;
	table_template.forEach((table) => {
		if (
			typeof table.table_name === 'string' &&
			typeof table.column_name === 'string'
		) {
			checked += checkTableInSchema(table.table_name);
			checked += checkColumnInSchema(
				table.table_name,
				table.column_name,
				table
			);
		}
	});
	if (errors.length > 0) {
		status = 'ERROR';
	}
	console.log(
		`Table and column in table_template are in schema: checked ${checked}`
	);
	return { test, status, errors };

	function checkTableInSchema(table_name: string) {
		let checked = 0;
		if (table_name) {
			const table = tables.find((table) => table.table_name === table_name);
			if (!table) {
				errors.push(`table_template: ${table_name} is not in schema`);
			}
			checked = 1;
		}
		return checked;
	}
	function checkColumnInSchema(
		table_name: string,
		column_name: string,
		tableInTemplate: unknownInputs
	) {
		let checked = 0;
		if (table_name && column_name) {
			const column = columns.find(
				(column) =>
					column.table_name === table_name && column.column_name === column_name
			);
			if (!column) {
				errors.push(
					`table_template: ${table_name} / ${column_name} is not in schema`
				);
			}
			checked = 1;
			// check column data type and default value between tableInTemplate and column
			if (column && tableInTemplate) {
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
				// check nullability
				const schemaNullable: boolean = column.is_nullable === 'YES';
				const templateNullable = !tableInTemplate.not_null;
				if (schemaNullable !== templateNullable) {
					errors.push(
						`schema: ${table_name} / ${column_name} is_nullable is different between table_template and schema`
					);
				}
			}
		}
		return checked;
	}
}
