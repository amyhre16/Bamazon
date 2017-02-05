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

// run the displayTable and pass in promptUser as a callback function
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
		connection.query('SELECT stock_quantity, product_name, price FROM products WHERE item_id = ' + response.chosen_id, function(err, row) {
			// if there's an error, console the error and kill the code
			if (err) {
				throw err;
			}

			// if there is enough of the product in the inventory, the allow the user to purchase the product
			if (row[0].stock_quantity >= response.numOfProd) {
				// subtract the user's response from the inventory
				var new_stock_quantity = row[0].stock_quantity - response.numOfProd;
				// update the table 
				connection.query('UPDATE products SET ? WHERE ?', [ { stock_quantity: new_stock_quantity}, {item_id: response.chosen_id} ], function(err, result) {
					// if there is an error, console the err and kill the code
					if (err) {
						throw err;
					}
				}); // end of UPDATE query
				
				// console the price of the interaction
				var totalCost = row[0].price * response.numOfProd;
				console.log("\nTotal Cost of Purchase: $" + totalCost);

				// display the updated table
				displayTable();
			}
			// if there is 0 stock left, inform the user and ask if they would like to continue
			else if (row[0].stock_quantity === 0) {
				console.log("\nI'm sorry! We don't seem to have " + row[0].product_name + " in stock.\n");
				promptContinue();
			}
			// if the user tries to purchase more than there is in the inventory, inform the user and ask if they would like to continue
			else {
				console.log("\nI'm sorry! There is not enough " + row[0].product_name + " in stock to fulfill your order.\n");
				promptContinue();
			}
		}); // end of connection.query()
	}); // end of .then()
} // end of promptUser()


// consider putting the prompt in a callback
function displayTable(callback) {
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

		// if there was a callback function passed in, the run the callback
		if (callback) {
			callback();
		}
		// otherwise, prompt the user if they would like to continue
		else {
			promptContinue();
		}
	});
	// connection.end();
} // end of displayTable()

function promptContinue() {
	// prompt the user if they would like to continue
	inquirer.prompt([
		{
			type: 'confirm'
			, name: 'continue'
			, message: 'Would you like to purchase another product?'
		} // end of continue object
	]).then(function(response) {
		// if they would like to continue, display the table and run promptUser
		if (response.continue) {
			console.log();
			displayTable(promptUser);
		}

		// otherwise, say good-bye and end the connection to the database
		else {
			// end connection to SQL server
			console.log("Goodbye!");
			connection.end();
		}
	});
}