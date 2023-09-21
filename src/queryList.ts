import { querySchema, queryViewData, unknownInputs } from './db/db-node-pg';

export async function queryList() {
	const response = await queryViewData({ viewName: 'enquiry_extract' });
	console.log('response :' + JSON.stringify, response.rows);
}

export async function logSchema(): Promise<{
	tables: unknownInputs[];
	columns: unknownInputs[];
}> {
	let response = await querySchema('tables');
	const tables = response.rows;
	//console.log('tables :' + JSON.stringify, response.rows);
	response = await querySchema('columns');
	const columns = response.rows;
	//console.log('columns :' + JSON.stringify, response.rows);
	return { tables, columns };
}

export async function logTemplates(): Promise<{
	table_template: unknownInputs[];
	view_template: unknownInputs[];
	list_template: unknownInputs[];
}> {
	let response = await querySchema('table_template');
	const table_template: unknownInputs[] = response.rows;
	//console.log('table_template :' + JSON.stringify, response.rows);
	response = await querySchema('view_template');
	const view_template: unknownInputs[] = response.rows;
	//console.log('view_template :' + JSON.stringify, response.rows);
	response = await querySchema('list_template');
	const list_template: unknownInputs[] = response.rows;
	//console.log('list_template :' + JSON.stringify, response.rows);
	return { table_template, view_template, list_template };
}

export async function checkListTemplate() {
	const { list_template, view_template, table_template } = await logTemplates();
	let matchedTableColumn = 0;
	let matchedViewColumn = 0;
	let unMatchedListColumn = 0;
	let matchedTableAndViewColumn = 0;

	list_template.forEach((list) => {
		console.log(
			'list_template view / table / column:' +
				list.view_name +
				' / ' +
				list.table_name +
				' / ' +
				list.column_name
		);
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
	console.log(
		`Check view list\n:matchedTableColumn: ${matchedTableColumn} \nmatchedViewColumn: ${matchedViewColumn} \nunMatchedListColumn: ${unMatchedListColumn} \nmatchedTableAndViewColumn: ${matchedTableAndViewColumn}`
	);
}
//checkListTemplate();
