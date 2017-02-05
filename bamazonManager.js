'use strict';

var mysql = require('mysql');
var inquirer = require('inquirer');

var Table = require('cli-table');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'secret',
	database: 'Bamazon'
});

connection.connect();

initialPrompt();


function initialPrompt() {
	inquirer.prompt([
		{
			type: 'list',
			name: 'choice',
			message: 'What would you like to do?',
			choices: ['View Produts for Sale'
				, 'View Low Inventory'
				, 'Add to Inventory'
				, 'Add New Product'],
			default: 'View Products for Sale'
		}
	]).then(function(response) {
		switch(response.choice) {
			case 'View Produts for Sale':
				viewProductsForSale();
				break;
			case 'View Low Inventory':
				viewLowInventory();
				break;
			case 'Add to Inventory':
				addToInventory();
				break;
			case 'Add New Product':
				addNewProduct();
				break;
			default:
				break;
		}

	}); // end of .then()
}


function viewProductsForSale(callback) {
	connection.query('SELECT * FROM products', function(err, result) {
		if (err) {
			throw err;
		}

		displayTable(result);

		if (callback) {
			callback();
		}
		else {
			promptContinue();
		}
	}); // end of SELECT * FROM products query


} // end of viewProductsForSale()

function viewLowInventory() {
	connection.query('SELECT * FROM products WHERE stock_quantity < ?', [5], function(err, result) {
		if (err) {
			throw err;
		}
		displayTable(result);
		promptContinue();
	}); // end of SELECT * FROM products WHERE stock_quantity < ?
} // end of viewLowInventory()


function addToInventory() {
	viewProductsForSale(updateInventory);
} // end of addToInventory()


function updateInventory() {
	inquirer.prompt([
		{
			type: 'input'
			, name: 'item_id'
			, message: 'Please enter the id of the product you would like to add.'
			, validate: function(id) {
				return !isNaN(parseInt(id));
			}
		} // end of item_id object
		, {
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How many of the product would you like to add?'
			, validate: function(num) {
				return !isNaN(parseInt(num)) && parseInt(num) > 0;
			}
		} // end of stock_quantity object
	]).then(function(response) {
		// do stuff
		connection.query('SELECT * FROM products WHERE ?', {item_id: response.item_id}, function(err, res) {
			var newQuan = parseInt(res[0].stock_quantity) + parseInt(response.stock_quantity);
			connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuan, response.item_id], function(err, result) {
				if (err) {
					throw err;
				}
				viewProductsForSale();
			}); // end of UPDATE products SET stock_quantity = ? WHERE item_id = ?
		}); // end of SELECT * FROM products WHERE ?
	}); // end of .then()
} // end of updateInventory

function addNewProduct() {
	inquirer.prompt([
		{
			type: 'input'
			, name: 'product_name'
			, message: 'Please enter the name of the product you would like to add.'
		}, // end of product_name object
		{
			type: 'input'
			, name: 'department_name'
			, message: 'What department is this product in?'
			, validate: function(depName) {
				return typeof depName === 'string';
			}
		}, // end of department_name object
		{
			type: 'input'
			, name: 'price'
			, message: 'How much does this product cost?'
			, validate: function(prodPrice) {
				return !isNaN(parseFloat(prodPrice));
			}
		}, // end of price object
		{
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How many would you like to add?'
			, validate: function(quan) {
				return !isNaN(parseInt(quan));
			}
		} // end of stock_quantity object
	]).then(function(response) {
		connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [response.product_name, response.department_name, response.price, response.stock_quantity], function(err, result) {
			if (err) {
				throw err;
			}

			viewProductsForSale();
		});
	}); // end of .then()
} // end of addNewProduct()

// display the results of the query in a table
function displayTable(result) {
	var header = [];
	var colWidths = [];
	for(var propName in result[0]) {
		header.push(propName);
		switch(propName) {
			case 'item_id':
				colWidths.push(10);
				break;
			case 'product_name':
				colWidths.push(40);
				break;
			case 'department_name':
				colWidths.push(40);
				break;
			case 'price':
				colWidths.push(10);
				break;
			default:
				colWidths.push(20);
				break;
		} // end of switch(propName)
	} // end of for (var propName in result[0])
	
	var table = new Table({
		head: header,
		colWidths: colWidths
	}); // end of table

	for (var i = 0; i < result.length; i++) {
		var row = [];
		for (var colName in header) {
			row.push(result[i][header[colName]]);
		}
		table.push(row);
	} // end end of for(var i = 0; i < result.length; i++)
	console.log();
	console.log(table.toString());
	console.log();
} // end of displayTable();


function promptContinue() {
	inquirer.prompt([
		{
			type: 'confirm'
			, name: 'cont'
			, message: 'Would you like to make another query?'
		}
	]).then(function(response) {
		if (response.cont) {
			console.log();
			initialPrompt();
		}

		else {
			console.log("\nGood-bye!");
			endConnection();
		}
	}); // end of .then()
} // end of promptContinue()


// end the connection to the database
function endConnection() {
	connection.end();
} // end of endConnection()