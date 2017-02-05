-- create database named Bamazon --
CREATE DATABASE IF NOT EXISTS Bamazon; 

-- change the current database to 
USE Bamazon;

-- create products table --
CREATE TABLE IF NOT EXISTS products(
	-- unique idea for each product --
    item_id INTEGER(10) auto_increment NOT NULL,
    
    -- name of product, 255 bytes is the largest varchar can be --
    product_name VARCHAR(255) NOT NULL,
    
    -- name of department --
    department_name VARCHAR(150),
    
    -- price to customers --
    price FLOAT(2),
    
    -- how much of the product is available in stores --
    stock_quantity INTEGER(10),
    
    -- make item_id the primary key --
    PRIMARY KEY(item_id)
);