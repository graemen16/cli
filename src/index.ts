import { log } from 'console';
import { querySchema } from './db/db-node-pg';
import { logSchema, logTemplates } from './queryList';
import {
	listColInTemplates,
	snakeCase as namesAreSnakeCase,
	tableTemplateInSchema,
	tablesHaveIdColumn,
} from './rule-checks';

export default async function main() {
	console.log('Check database');
	const { list_template, view_template, table_template } = await logTemplates();
	let results = [];
	// get schema
	const { tables, columns } = await logSchema();

	results.push(
		listColInTemplates({ list_template, view_template, table_template })
	);
	results.push(
		namesAreSnakeCase({ list_template, view_template, table_template })
	);

	results.push(tablesHaveIdColumn({ tables, columns }));
	results.push(tableTemplateInSchema({ tables, columns, table_template }));
	console.log('Results:');
	console.log(results);
}
main();
