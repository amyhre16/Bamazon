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
			console.log("adding product");
			addNewProduct();
			break;
		default:
			break;
	}

}); // end of .then()



function viewProductsForSale() {
	connection.query('SELECT * FROM products', function(err, result) {
		if (err) {
			throw err;
		}

		displayTable(result);
		// endConnection();
	});
} // end of viewProductsForSale()

function viewLowInventory() {
	connection.query('SELECT * FROM products WHERE stock_quantity < ?', [5], function(err, result) {
		if (err) {
			throw err;
		}
		displayTable(result);
		// endConnection();
	})
} // end of viewLowInventory()

function addToInventory() {
	viewProductsForSale().then(updateInventory());
	/*inquirer.prompt([
		{
			type: 'input'
			, name: 'item_id'
			, message: 'Which product inventory would you like to add to?'
			, validate: function(id) {
				return !isNaN(parseInt(id));
			}
		}
		, {
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How much of it would you like to add?'
			, validate: function(num) {
				return !isNaN(parseInt(num));
			}
		}
	]).then(function(response) {
		// do stuff
		connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: response.stock_quantity}, {item_id: response.id}], function(err, result) {
			if (err) {
				throw err;
			}

			console.log(result);
		}).then(viewProductsForSale).then(endConnection());
	});*/

	// endConnection();
} // end of addToInventory()


function updateInventory() {
	inquirer.prompt([
		{
			type: 'input'
			, name: 'item_id'
			, message: 'Which product inventory would you like to add to?'
			, validate: function(id) {
				return !isNaN(parseInt(id));
			}
		}
		, {
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How much of it would you like to add?'
			, validate: function(num) {
				return !isNaN(parseInt(num));
			}
		}
	]).then(function(response) {
		// do stuff
		connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: response.stock_quantity}, {item_id: response.id}], function(err, result) {
			if (err) {
				throw err;
			}

			console.log(result);
		}).then(viewProductsForSale).then(endConnection());
	});
}

function addNewProduct() {
	inquirer.prompt([
		{
			type: 'input'
			, name: 'product_name'
			, message: 'Please enter the name of the product you would like to add.'
		},
		{
			type: 'input'
			, name: 'department_name'
			, message: 'What department is this product in?'
			, validate: function(depName) {
				return depName !== 'string';
			}
		},
		{
			type: 'input'
			, name: 'price'
			, message: 'How much does this product cost?'
			, validate: function(prodPrice) {
				return !isNaN(parseFloat(prodPrice));
			}
		},
		{
			type: 'input'
			, name: 'stock_quantity'
			, message: 'How many would you like to add?'
			, validate: function(quan) {
				return !isNaN(parseInt(quan));
			}
		}
	]).then(function(response) {
		connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [response.product_name, response.department_name, response.price, response.stock_quantity], function(err, result) {
			if (err) {
				throw err;
			}
			console.log(result);
		});
	});

	// endConnection();
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

	console.log(table.toString());
} // end of displayTable();

// end the connection to the database
function endConnection() {
	connection.end();
} // end of endConnection()