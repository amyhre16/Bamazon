'use strict';

// import the npm packages
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

// create an object to create a connnection 
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'secret',
	database: 'Bamazon'
});

// connect to the database
connection.connect();

// execute the initialPrompt function
initialPrompt();


function initialPrompt() {
	// ask the user what action they would like to take
	inquirer.prompt([
		{
			type: 'list', // prompts user with a list of choices
			name: 'choice', // name of this prompt
			message: 'What would you like to do?',
			choices: ['View Produts for Sale'
				, 'View Low Inventory'
				, 'Add to Inventory'
				, 'Add New Product'],
			default: 'View Products for Sale'
		}
	]).then(function(response) { // once the user makes a choice, run this function
		// check the user's choice against the cases, if the case matches up, run the respective function
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
		} // end of switch statement

	}); // end of .then()
} // end of initialPrompt()


function viewProductsForSale(callback) {
	// run a query that returns all columns from the products table
	// once the query is done, run the callback function
	connection.query('SELECT * FROM products', function(err, result) {
		// if there is an error, console the err and kill the code
		if (err) {
			throw err;
		}

		// display the results in a cli table
		displayTable(result);

		// if there was a callback function passed into viewProductsForSale, then run the callback function
		if (callback) {
			callback();
		}
		// otherwise, prompt the user if they would like to continue
		else {
			promptContinue();
		}
	}); // end of SELECT * FROM products query


} // end of viewProductsForSale()

function viewLowInventory() {
	// run query that returns all columns from products table where the stock_quantity is less than 5
	// the ? at the end of the query clause is a placeholder for the array that follows. This helps prevent sql injections
	connection.query('SELECT * FROM products WHERE stock_quantity < ?', [5], function(err, result) {
		// if there is an error, console the err and kill the code
		if (err) {
			throw err;
		}

		// display the results in a cli table
		displayTable(result);

		// prompt the user if they would like to continue
		promptContinue();
	}); // end of SELECT * FROM products WHERE stock_quantity < ?
} // end of viewLowInventory()


function addToInventory() {
	// run the viewProductsForSale function and pass in updateInventory() as the callback function
	// this allows the user to view the products that are in the inventory so that they can see the id of the product they want to add to
	viewProductsForSale(updateInventory);
} // end of addToInventory()


function updateInventory() {
	// prompt the user about the product you would like to update
	inquirer.prompt([
		{
			type: 'input' // user will be prompted to input their answer
			, name: 'item_id' // name of response is item_id
			, message: 'Please enter the id of the product you would like to add.' // message that displays to the user
			, validate: function(id) { // validation function that ensures the user's input is a number
				return !isNaN(parseInt(id));
			}
		} // end of item_id object
		, {
			type: 'input'  // user will be prompted to input their answer
			, name: 'stock_quantity' // name of response is stock_quantity
			, message: 'How many of the product would you like to add?' // message that displays to the user
			, validate: function(num) { // user is not allowed to enter a response that is not a number or a number that is 0 or negative
				return !isNaN(parseInt(num)) && parseInt(num) > 0;
			}
		} // end of stock_quantity object
	]).then(function(response) {
		// query that returns all columns from products table where the item_id is equal to response.item_id
		connection.query('SELECT * FROM products WHERE ?', {item_id: response.item_id}, function(err, res) {
			
			// add the stock_quantity from the table to the user's response
			var newQuan = parseInt(res[0].stock_quantity) + parseInt(response.stock_quantity);
			
			// update the row with item_id equal to the item id the user inputed and set the stock_property to newQuan
			connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuan, response.item_id], function(err, result) {
				// if there is an error, console the err and kill the code
				if (err) {
					throw err;
				}

				// run the viewProductsForSale function to display the updated table
				viewProductsForSale();
			}); // end of UPDATE products SET stock_quantity = ? WHERE item_id = ?
		}); // end of SELECT * FROM products WHERE ?
	}); // end of .then()
} // end of updateInventory

function addNewProduct() {
	// prompt the user about what product they would like to add to the table
	inquirer.prompt([
		{
			type: 'input' // user will be asked to input their response
			, name: 'product_name'
			, message: 'Please enter the name of the product you would like to add.'
		}, // end of product_name object
		{
			type: 'input'
			, name: 'department_name'
			, message: 'What department is this product in?'
			, validate: function(depName) { // response must be a string
				return typeof depName === 'string';
			}
		}, // end of department_name object
		{
			type: 'input'
			, name: 'price'
			, message: 'How much does this product cost?'
			, validate: function(prodPrice) { // response must be a positive number
				return !isNaN(parseFloat(prodPrice)) && parseFloat(prodPrice) > 0;
			}
		}, // end of price object
		{
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How many would you like to add?'
			, validate: function(quan) { // response must be a positive integer
				return !isNaN(parseInt(quan)) && parseInt(quan) > 0;
			}
		} // end of stock_quantity object
	]).then(function(response) {
		// run a query that inserts the user's response into the table
		connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [response.product_name, response.department_name, response.price, response.stock_quantity], function(err, result) {
			// if there is an error, console the err and kill the code
			if (err) {
				throw err;
			}

			// display the updated table 
			viewProductsForSale();
		});
	}); // end of .then()
} // end of addNewProduct()

// display the results of the query in a table
function displayTable(result) {
	// empty arrays that will store the headers of the columns and the column widths
	var header = [];
	var colWidths = [];
	
	// grab the name of the properties from the result object and push them to the header array
	for(var propName in result[0]) {
		header.push(propName);
		// check the headers to determine the width of the column widths
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
	
	// create a new table with the column names as the heads and assign the width of each column
	var table = new Table({
		head: header,
		colWidths: colWidths
	}); // end of table

	// for each row in products, push each column to the row array then push row to the table
	for (var i = 0; i < result.length; i++) {
		var row = [];
		for (var colName in header) {
			row.push(result[i][header[colName]]);
		}
		table.push(row);
	} // end end of for(var i = 0; i < result.length; i++)

	// display the table
	console.log();
	console.log(table.toString());
	console.log();
} // end of displayTable();


function promptContinue() {
	// ask the user if they would like to continue
	inquirer.prompt([
		{
			type: 'confirm'
			, name: 'cont'
			, message: 'Would you like to make another query?'
		}
	]).then(function(response) {
		// if they would like to continue, run initialPrompt()
		if (response.cont) {
			console.log();
			initialPrompt();
		}

		// otherwise, say good-bye to the user and end the connection
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