//import { unknownInputs } from "@/lib/form-utils"
import 'dotenv/config';
import { Pool, Client } from 'pg';

// pools will use environment variables
// for connection information

require('console-stamp')(console);

export type unknownInputs = {
	[key: string]: unknown;
};
const pgConfig = {
	database: process.env['POSTGRES_DATABASE'],
	host: process.env['POSTGRES_HOST'],
	user: process.env['POSTGRES_USER'],
	password: process.env['POSTGRES_PASSWORD'],
	port: Number.parseInt(process.env['POSTGRES_PORT'] || '0'),
	max: 10,
	ssl: true,
};

export const querySchema = async (mode: string) => {
	const pool = new Pool(pgConfig);
	// you can also use async/await
	let table: string = null;
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
			return null;
	}

	const res = await pool.query('SELECT * FROM ' + table);
	//console.log(' queryMasterTable : ' + res.rows[0]);
	await pool.end();
	return res;
};

export async function queryViewColumns(viewList: string): Promise<any> {
	const pool = new Pool(pgConfig);
	const sql = `select 
vl.column_name
, vl.list_order
, coalesce (mt.type, mv.type) as type
, coalesce (vl.view_label,mt.column_label,mv.column_label  )  as label
, vl.crud
, vl.display_for 
, vl.form_type 
, mt.not_null 
, mt.source_list 
, mt.source_column
, mt.min_length 
, mt.max_length 
, mt.min_value 
, mt.max_value 
, mt."schema" 
, mt.table_name 
  from gv_dev.view_list vl 
  left join gv_dev.master_table mt on mt.table_name = vl.table_name and mt.column_name =vl.column_name 
  left join gv_dev.master_view mv on mv.view_name =vl.view_name and mv.column_name =vl.column_name 
  where vl.list_name = $1
  order by vl.list_order`;
	const values = [viewList];
	//console.log("queryViewList: " + sql + " " + values)
	const res = await pool.query(sql, values);
	console.log(' queryViewList row 0: ' + res.rows[0]);
	await pool.end();
	return res;
}
export type ViewColumn = {
	column_name: string;
	list_order: number;
	type: string;
	label: string;
	crud: string;
	display_for: string;
	form_type: string;
	not_null: boolean;
	source_list: string;
	source_column: string;
	min_length: number;
	max_length: number;
	min_value: number;
	max_value: number;
	schema: string;
	table_name: string;
};
// query view data based on a view or table name.
export async function queryViewData({
	viewName,
	itemId,
	pageIndex,
	pageSize,
}: {
	viewName: string;
	itemId?: number;
	pageIndex?: number;
	pageSize?: number;
}): Promise<any> {
	let paramIndex = 1;
	const pool = new Pool(pgConfig);
	let sql = `select * from gv.${viewName}`;
	let values: any[] = [];
	if (itemId) {
		sql += ` \nwhere id = $` + paramIndex++; // note requires query to include id column!
		values.push(itemId);
	}
	if (pageIndex && pageSize) {
		sql += ` \nlimit $` + paramIndex++ + ` offset $` + paramIndex++;
		values.push(pageSize, (pageIndex - 1) * pageSize);
	}

	console.log(' queryViewData: ' + sql + ' ' + values);
	const res = await pool.query(sql, values);
	//console.log(res.rows[0])
	await pool.end();
	return res;
}

/*
// clients will also use environment variables
// for connection information
const client = new Client()
await client.connect()

const res = await client.query("SELECT NOW()")
await client.end()
*/
export async function upsertForm(
	columns: ViewColumn[],
	data: unknownInputs
): Promise<
	{
		table: string;
		rowCount?: number | undefined;
		insertedId?: number | undefined;
	}[]
> {
	// don't include validation, but pass back any database errors
	// which table are we upserting to?
	console.log('upsertForm');
	const keys = Object.keys(data); // key being a form element name
	const targetTables: string[] = []; // need iterable to map over

	keys.forEach((key) => {
		const column = columns.find((column) => column.column_name === key);
		if (!column) {
			throw new Error('No column for key ' + key);
		}
		// note:  want unique values only. Couldn't use set as it doesn't support mapping
		const tableName = `${column.schema}.${column.table_name}`;
		if (!targetTables.includes(tableName)) {
			targetTables.push(tableName);
		}
	});
	console.log('targetTables: ', targetTables);
	const pool = new Pool(pgConfig);

	const updateMode: boolean = data.id ? (data.id as number) > 0 : false;

	async function insertResult() {
		let insertRes: {
			table: string;
			rowCount?: number | undefined;
			insertedId?: number | undefined;
		}[] = [];
		await Promise.all(
			targetTables.map(async (table) => {
				const res = updateMode
					? await updateTable(table)
					: await insertTable(table);
				console.log('table res: ', res);
				insertRes.push(res);
			})
		);
		return insertRes;
	}
	const response = await insertResult();

	await pool.end();
	console.log('returnValue: ' + response);
	return response; // TODO - need to return the id of the inserted row - this returns before the insert is complete!

	async function insertTable(table: string) {
		let statementIndex = 1;
		let values: any[] = [];
		// build the insert statement
		let sql = `insert into ${table} \n`;
		let columnsSql = '(';
		let valuesSql = 'values (';

		keys.forEach((key) => {
			const column = columns.find((column) => column.column_name === key);

			if (column && column.column_name !== 'id') {
				columnsSql += `${column.column_name}, `;
				valuesSql += `$` + statementIndex++ + `, `;
				values.push(data[key]);
			}
		});
		columnsSql = columnsSql.slice(0, -2); // remove last comma
		columnsSql += ')\n';
		valuesSql = valuesSql.slice(0, -2); // remove last comma
		valuesSql += ')\n';
		sql += columnsSql + valuesSql;
		sql += `returning id`;
		console.log('insert: \n' + sql + ' ' + values);

		const res = await pool.query(sql, values);
		const response: {
			table: string;
			insertedId: number | undefined;
		} = { table: table, insertedId: res.rows[0].id };
		return response;
	}

	async function updateTable(table: string) {
		let statementIndex = 1;
		//let values: { index: number; value: any }[] = []
		let values: any[] = [];
		let sql = `update ${table} set \n`;
		keys.forEach((key) => {
			const column = columns.find((column) => column.column_name === key);
			if (column) {
				sql += `${column.column_name} = $` + statementIndex++ + `, \n`;
				values.push(data[key]);
			}
		});
		sql = sql.slice(0, -3); // remove last comma
		sql += `\nwhere id = $` + statementIndex++ + '\n'; // note requires query to include id column!
		values.push(data.id);
		console.log('update: ' + sql + ' ' + values);
		const res = await pool.query(sql, values);
		const response: {
			table: string;
			rowCount: number | undefined;
		} = { table: table, rowCount: res.rowCount };
		return response;
	}
}
