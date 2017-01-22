'use strict';
var mysql = require('mysql');
var inquirer = require('inquirer');
// from https://github.com/Automattic/cli-table
var Table = require('cli-table');

var table = new Table({
	head: ['ID', 'Product', 'Department', 'Price', 'Stock Quantity'],
	colWidths: [10, 40, 40, 10, 20]
});

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'secret',
	database: 'Bamazon'
});

connection.connect();

connection.query('SELECT * FROM products;', function(err, rows, fields) {
	if (err) {
		throw err;
	}

	for (var i = 0; i < rows.length; i++) {
		var row = [];
		row.push(rows[i].item_id,
			rows[i].product_name,
			rows[i].department_name,
			rows[i].price,
			rows[i].stock_quantity);

		table.push(row);
	}
	console.log(table.toString());
});

connection.end();