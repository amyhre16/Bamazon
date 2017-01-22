-- create database named Bamazon --
-- CREATE DATABASE Bamazon; --

-- change the current database to 
-- USE Bamazon; --

-- create products table --
/*
CREATE TABLE products(
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
*/

-- populate table --
INSERT INTO products
(product_name, department_name, price, stock_quantity)
values
('XBOX ONE', 'Video Games', 265, 1000),
('iPhone 7', 'Cell Phones', 715, 843),
('10 Pack of Ball Point Pens - Black', 'Office Supplies', 4, 634),
('Nike Shoes', 'Footwear', 125, 200),
('Keurig K Cups', 'Kitchen and Dining', 15, 384),
('Swiss Backpack', 'Luggage & Travel Gear', 84, 600),
('Merlot Wine', 'Wine', 42, 400),
('Key Ring', 'Miscellaneous', 1, 3000),
('Expo Dry Erase Marker', 'Office Supplies', 3, 402),
('Superman Figurine', 'Collectibles', 130, 6);