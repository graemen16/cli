import { queryViewData } from './db/db-node-pg';

export default async function queryList() {
	const response = await queryViewData({ viewName: 'enquiry_extract' });
	console.log('response :' + JSON.stringify, response.rows);
}

queryList();
