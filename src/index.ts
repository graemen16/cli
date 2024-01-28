import { log } from 'console';
import { querySchema } from './db/db-node-pg';
import { logSchema, logTemplates } from './queryList';
import {
	listColInTemplates,
	snakeCase as namesAreSnakeCase,
	tableTemplateInSchema,
	tablesHaveIdColumn,
	listTemplateInSchema,
} from './rule-checks';

export default async function main() {
	console.log('Check database');
	const { list_template, view_template, table_template } = await logTemplates();
	let results = [];
	// get schema
	const { tables, columns } = await logSchema();

	true && results.push(listColInTemplates({ list_template, view_template, table_template }));
	true && results.push(namesAreSnakeCase({ list_template, view_template, table_template }));

	false && results.push(tablesHaveIdColumn({ tables, columns }));
	results.push(tableTemplateInSchema({ tables, columns, table_template }));
	results.push(listTemplateInSchema({ tables, columns, list_template }));
	console.log('Results:');
	console.log(results);
}
main();
