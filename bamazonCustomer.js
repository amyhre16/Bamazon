'use strict';

// import node packages 
var mysql = require('mysql');
var inquirer = require('inquirer');
// from https://github.com/Automattic/cli-table
var Table = require('cli-table');

// create the connection to the SQL server
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'secret',
	database: 'Bamazon'
});

// connect to the server
connection.connect();


displayTable(promptUser);

function promptUser() {
	// create questions to ask the user
	inquirer.prompt([
		{
			type: "input",
			name: "chosen_id",
			message: "Please enter the ID of the product you would like to purchase."
		},
		{
			type: "input",
			name: "numOfProd",
			message: "How many units of the product would you like to purchase?"
		}
	]).then(function(response) {
		// select the stock_quantity column from the products table where the item_id is the same as the id entered by the user
		connection.query('SELECT stock_quantity, product_name FROM products WHERE item_id = ' + response.chosen_id, function(err, row) {
			// if there's an error, console the error and kill the code
			if (err) {
				throw err;
			}
			if (row[0].stock_quantity >= response.numOfProd) {
				var new_stock_quantity = row[0].stock_quantity - response.numOfProd;
				connection.query('UPDATE products SET stock_quantity = ' + new_stock_quantity + ' WHERE item_id = ' + response.chosen_id);
				displayTable();
			}
			else if (row[0].stock_quantity === 0) {
				console.log("\nI'm sorry! We seem to be out of " + row[0].product_name + "\n");
			}
			else {
				console.log("\nI'm sorry! There is not enough of " + row[0].product_name + " in stock to fulfill your order.\n");
			}
			promptContinue();
		});

	});
}



function displayTable(callback) {
	// connection.connect();
	// select all columns from the products table
	connection.query('SELECT * FROM products;', function(err, rows) {
		// if there's an error, console the error and kill the code
		if (err) {
			throw err;
		}

		// create a new table with the column names as the heads and assign the width of each column
		var table = new Table({
			head: ['ID', 'Product', 'Department', 'Price', 'Stock Quantity'],
			colWidths: [10, 40, 40, 10, 20]
		});

		// for each row in products, push each column to the row array then push row to the table
		for (var i = 0; i < rows.length; i++) {
			var row = [];
			row.push(rows[i].item_id,
				rows[i].product_name,
				rows[i].department_name,
				rows[i].price,
				rows[i].stock_quantity);

			table.push(row);
		}
		// print the table
		console.log();
		console.log(table.toString());
		console.log();

		if (callback) {
			callback();
		}
		else {
			promptContinue();
		}
	});
	// connection.end();
} // end of displayTable()

function promptContinue() {
	inquirer.prompt([
		{
			type: 'confirm'
			, name: 'continue'
			, message: 'Would you like to purchase another product?'
		} // end of continue object
	]).then(function(response) {
		if (response.continue) {
			promptUser();
		}

		else {
			// end connection to SQL server
			console.log("\nGoodbye!");
			connection.end();
		}
	});
}