CREATE DATABASE cs6400_team024;

CREATE TABLE cs6400_team024.City (
    cityID INT(16) unsigned NOT NULL AUTO_INCREMENT,
    city VARCHAR(60) NOT NULL,
    state VARCHAR(20) NOT NULL,
    population INT NOT NULL,
    PRIMARY KEY (cityID),
    UNIQUE KEY (city,state)
);

CREATE TABLE cs6400_team024.Store (
    storeID INT(16) unsigned NOT NULL AUTO_INCREMENT,
    store_number VARCHAR(20) NOT NULL, 
    phone_number VARCHAR(100),
    street_address VARCHAR(100),
  --  state VARCHAR(20) NOT NULL,
    cityID INT(16) unsigned NOT NULL,
    PRIMARY KEY (storeID)
    ,UNIQUE KEY (store_number)   
);

ALTER TABLE cs6400_team024.Store
    ADD CONSTRAINT fk_Store_cityID_City_cityID FOREIGN KEY (cityID)
REFERENCES `City` (cityID);


CREATE TABLE cs6400_team024.ActiveManager (
    activeManagerID INT(16) unsigned NOT NULL, 
    email VARCHAR(50) NOT NULL,
    manager_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (activeManagerID),
    UNIQUE KEY (email) 
);


CREATE TABLE cs6400_team024.InActiveManager (
    inActiveManagerID INT(16) unsigned NOT NULL AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    manager_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (inActiveManagerID),
    UNIQUE KEY (email) 
);


CREATE TABLE cs6400_team024.Manage (
    storeID INT(16) unsigned NOT NULL,
    activeManagerID INT(16) unsigned NOT NULL,
    PRIMARY KEY (storeID, activeManagerID)
);

ALTER TABLE cs6400_team024.Manage
    ADD CONSTRAINT fk_Manage_storeID_Store_storeID FOREIGN KEY (storeID)
REFERENCES `Store` (storeID);

ALTER TABLE cs6400_team024.Manage
    ADD CONSTRAINT fk_Manage_activeManagerID_ActiveManager_activeManagerID FOREIGN KEY (activeManagerID)
REFERENCES `ActiveManager` (activeManagerID);


CREATE TABLE cs6400_team024.Manufacturer (
    manufacturerID INT(16) unsigned NOT NULL AUTO_INCREMENT,
    manufacturer_name VARCHAR(255) NOT NULL,
    max_discount DECIMAL(18, 2),
    PRIMARY KEY (manufacturerID),
    UNIQUE KEY (manufacturer_name)
);


CREATE TABLE cs6400_team024.Category (
    categoryID INT(16) unsigned NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (categoryID),
    UNIQUE KEY (category_name) 
);


CREATE TABLE cs6400_team024.Date (
    date DATE NOT NULL,
    holiday_name VARCHAR(255) NULL,
    PRIMARY KEY (DATE)
);

CREATE TABLE cs6400_team024.Product (
    pid VARCHAR(20) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    retail_price DECIMAL(18, 2) NOT NULL,
    manufacturerID INT(16) unsigned NOT NULL,
    PRIMARY KEY (pid)
);

ALTER TABLE cs6400_team024.Product
    ADD CONSTRAINT fk_Product_manufacturerID_Manufacturer_manufacturerID FOREIGN KEY (manufacturerID)
REFERENCES `Manufacturer` (manufacturerID);


CREATE TABLE cs6400_team024.Label (
    categoryID INT(16) unsigned NOT NULL,
    pid  VARCHAR(20) NOT NULL,
    PRIMARY KEY (categoryID, pid)
);

ALTER TABLE cs6400_team024.Label
    ADD CONSTRAINT fk_Label_categoryID_Category_categoryID FOREIGN KEY (categoryID)
REFERENCES `Category` (categoryID);

ALTER TABLE cs6400_team024.Label
    ADD CONSTRAINT fk_Label_pid_Product_pid FOREIGN KEY (pid)
REFERENCES `Product` (pid);


CREATE TABLE cs6400_team024.SalesRecord (
    storeID INT(16) unsigned NOT NULL,
    pid VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (storeID, pid, date)
);

ALTER TABLE cs6400_team024.SalesRecord
    ADD CONSTRAINT fk_SalesRecord_storeID_Store_storeID FOREIGN KEY (storeID)
REFERENCES `Store` (storeID);

ALTER TABLE cs6400_team024.SalesRecord
    ADD CONSTRAINT fk_SalesRecord_pid_Product_pid FOREIGN KEY (pid)
REFERENCES `Product` (pid);

ALTER TABLE cs6400_team024.SalesRecord
    ADD CONSTRAINT fk_SalesRecord_date_Date_date FOREIGN KEY (date)
REFERENCES `Date` (date);


CREATE TABLE cs6400_team024.OnSale (
    pid VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    sale_price DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (pid, date)
);

ALTER TABLE cs6400_team024.OnSale
    ADD CONSTRAINT fk_OnSale_pid_Product_pid FOREIGN KEY (pid)
REFERENCES `Product` (pid);

ALTER TABLE cs6400_team024.OnSale
    ADD CONSTRAINT fk_OnSale_date_Date_date FOREIGN KEY (date)
REFERENCES `Date` (date);


CREATE TABLE cs6400_team024.Sell (
    storeID INT(16) unsigned NOT NULL,
    pid VARCHAR(20) NOT NULL,
    PRIMARY KEY (storeID, pid)
);

ALTER TABLE cs6400_team024.Sell
    ADD CONSTRAINT fk_Sell_pid_Product_pid FOREIGN KEY (pid)
REFERENCES `Product` (pid);

ALTER TABLE cs6400_team024.Sell
    ADD CONSTRAINT fk_Sell_storeID_Store_storeID FOREIGN KEY (storeID)
REFERENCES `Store` (storeID);





/*trigger for unassign manager*/
DELIMITER //

create TRIGGER cs6400_team024.unassign_after_delete_manage
AFTER DELETE
   ON manage FOR EACH ROW

BEGIN


INSERT INTO inactivemanager

SELECT *
FROM activemanager 
WHERE activemanagerid = OLD.activemanagerid
AND NOT exists (
SELECT *
FROM manage
WHERE storeid != OLD.storeid AND activemanagerid = OLD.activemanagerid)
;

DELETE FROM activemanager
WHERE   activemanagerid = OLD.activemanagerid
AND NOT exists (
SELECT *
FROM manage
WHERE storeid != OLD.storeid AND activemanagerid = OLD.activemanagerid)
;

END; //

DELIMITER ;


/*trigger for assign before insert*/

DELIMITER //

create TRIGGER cs6400_team024.unassign_before_insert_manage
BEFORE INSERT
   ON manage FOR EACH ROW

BEGIN


INSERT INTO activemanager

SELECT *
FROM inactivemanager 
WHERE inactivemanagerid = New.activemanagerid
AND NOT EXISTS (
SELECT *
FROM activemanager
WHERE  activemanagerid = New.activemanagerid)
;

DELETE FROM inactivemanager
WHERE   inactivemanagerid = New.activemanagerid

;


END; //

DELIMITER ;
