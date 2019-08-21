/*Main Menu Count*/
SELECT COUNT(storeID) FROM cs6400_team024.Store;
SELECT COUNT(manufacturerID) FROM cs6400_team024.Manufacturer;
SELECT COUNT(DISTINCT pid) FROM cs6400_team024.Product;
WITH CTE_Manager 
AS
(SELECT activeManagerID AS managerID
FROM cs6400_team024.activemanager
UNION 
SELECT inactiveManagerID AS managerID
FROM cs6400_team024.inactivemanager
)
SELECT COUNT(DISTINCT managerID) FROM CTE_Manager;

/*Edit Holiday*/
	/*need pass value to $date 
	view date
    only specific date pass*/
SELECT 
date, 
holiday_name 
FROM Date
WHERE date = CAST('$date'  AS DATE)
AND LENGTH (holiday_name)  > 0 ;
	/*date range has been applied*/
SELECT 
date, 
holiday_name 
FROM Date
WHERE date >= CAST('$start date' AS DATE)
AND date <= CAST('$end date' AS DATE)
AND LENGTH (holiday_name) > 0
ORDER BY date ASC;
	/*add date*/
UPDATE Date
SET holiday_name = CONCAT (holiday_name, ', ', '$holiday name') 
WHERE date =CAST( '$date' AS DATE);
	/*update date*/
UPDATE Date
SET holiday_name = '$holiday name' 
WHERE date =CAST( '$date' AS DATE);

/*Edit Manager*/
	/*view manager*/
WITH CTE_Manager AS
(SELECT DISTINCT activeManagerID AS managerID, email, manager_name
FROM ActiveManager
UNION
SELECT DISTINCT inactiveManagerID AS managerID, email, manager_name
FROM InActiveManager
)
SELECT  
CM.manager_name, 
CM.email, 
S.store_number
FROM CTE_Manager AS CM
LEFT JOIN Manage AS M 
 	ON M.activeManagerID = CM.managerID
LEFT JOIN Store AS S
	ON S.storeID = M.storeID
WHERE CM.manager_name = '$manager name'
OR CM.email = '$manager email' 
OR S.store_number = '$store number';
	/*add manager*/
INSERT INTO InActiveManager
(
manager_name,
email
)
VALUES ('$manager name', '$manager email');
	/*remove manager*/
DELETE FROM InActiveManager
WHERE email = '$manager email';
	/*assign manager*/
    /*trigger has been applied, automatically move the inactive manager to active manager*/
 WITH CTE_Manager 
AS
(SELECT activeManagerID AS managerID, email
FROM test.activemanager
UNION 
SELECT inactiveManagerID AS managerID, email
FROM test.inactivemanager
)
SELECT @managerid:= ManagerID FROM CTE_Manager where email = '$manager email' ;
SELECT @storeid:= storeID from store where store_number = '$store number';
INSERT INTO manage
SELECT @storeid,@managerid
;   
    /*unassign manager*/
    /*trigger has been applied, automatically move the active manager to inactive manager*/
select @var_name:= activeManagerID from activemanager  where email = '$manager email';
SELECT @storeid:= storeID from store where store_number = '$store number';
delete from manage where storeid = @storeid and activeManagerID = @var_name;

/*Edit Population*/
	/*view population*/
SELECT city, state, population
FROM City
WHERE city= '$city name' AND state= '$state name';

	/*edit population*/
UPDATE City
SET population = '$population'
WHERE city= '$city name' AND state = '$state name';


/*View Manufacturer’s Product Report*/
SELECT  
M.manufacturer_name, 
COUNT(DISTINCT P.PID) AS numbers_of_products, 
AVG(P.retail_price) AS average_retail_price, 
MIN(P.retail_price) AS minimum_retail_price, 
MAX(P.retail_price) AS maximum_retail_price
FROM Product P
INNER JOIN Manufacturer M ON P.manufacturerID = M.manufacturerID
GROUP BY M.manufacturer_name
ORDER BY AVG (P.retail_price) DESC
LIMIT 100;
	/*Detail*/
SELECT  
MF.manufacturer_name, 
MF.max_discount AS maximum_discount,
P.pid AS product_ID, 
P.product_name, 
GROUP_CONCAT(DISTINCT C.category_name ORDER BY C.category_name ASC SEPARATOR  ',') AS category_name, 
P.retail_price AS price 
FROM Manufacturer AS MF
LEFT JOIN Product AS P ON P.manufacturerID = MF.manufacturerID
LEFT JOIN Label AS L ON P.pid = L.pid
LEFT JOIN Category AS C ON C.categoryID = L.categoryID
GROUP BY 
MF.manufacturer_name, 
MF.max_discount, 
P.pid, 
P.product_name,
P.retail_price
ORDER BY P.retail_price DESC;

/*View Category Report*/
SELECT  
C.category_name AS category_name, 
COUNT(DISTINCT P.pid) AS numbers_of_products, 
COUNT(DISTINCT P.manufacturerID) AS numbers_of_manufacturer,
AVG(P.retail_price) AS average_retail_price
FROM Category AS C
LEFT JOIN Label AS L ON C.categoryID = L.categoryID
LEFT JOIN Product AS P ON P.pid = L.pid
GROUP BY C.category_name
ORDER BY C.category_name ASC;

/*View Actual versus Predicted Revenue for GPS units Report*/
SELECT  
P.pid AS productID,
P.product_name,
P.retail_price,
SUM(SR.quantity) AS numbers_of_sold,
SUM(CASE WHEN SLS.sale_price IS NOT NULL THEN SR.quantity 
	     ELSE 0 END) AS numbers_of_sold_at_discount,
SUM(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity 
	     ELSE 0 END) AS numbers_of_sold_at_retail_price,
SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) AS actual_revenue,
SUM(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price
	     ELSE SR.quantity *(1-0.25)*P.retail_price END) AS predicted_revenue,
SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price) - 
(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price
	     ELSE SR.quantity *(1-0.25)*P.retail_price END) )AS difference_of_revenue
FROM SalesRecord AS SR
INNER JOIN Label AS L ON SR.pid = L.pid
INNER JOIN Category C ON C.categoryID = L.categoryID 
INNER JOIN Product AS P ON P.pid = L.pid
LEFT JOIN OnSale AS SLS ON SLS.date = SR.date AND SLS.pid = P.pid
WHERE C.category_name = 'GPS'
GROUP BY P.pid, P.product_name, P.retail_price
HAVING ABS(SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)   - 
(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price
	     ELSE SR.quantity *(1-0.25)*P.retail_price END) )) > 5000
ORDER BY (SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price) - 
		(CASE WHEN SLS.sale_price IS NULL THEN SR.quantity * P.retail_price
	     		ELSE SR.quantity *(1-0.25)*P.retail_price END) )) DESC;

/*View Store Revenue by Year by State*/
SELECT  
S.store_number,
S.street_address AS store_address,
C.city,
YEAR(SR.date) AS sales_year,
SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) AS Total_Revenue
FROM Store S
INNER JOIN City C ON S.cityID = C.cityID
LEFT JOIN SalesRecord SR ON S.storeID = SR.storeID
LEFT JOIN Product P ON SR.pid = P.pid
LEFT JOIN OnSale SLS ON SLS.date = SR.date AND SR.pid = SLS.pid
WHERE C.state = '$state'
GROUP BY 
S.store_number,
S.street_address,
C.city,
YEAR(SR.date) 
ORDER BY YEAR(SR.date)  ASC, 
     SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) DESC;

/*View Air Conditioners on Groudhog Day*/
SELECT  
YEAR(DD.date) AS sales_year,
SUM(SR.quantity) AS total_number_of_sold,
SUM(SR.quantity)/365 AS average_numbers_of_sold,
SUM(CASE WHEN month(DD.date) = 2 and day(DD.date) = 2 THEN SR.quantity
	ELSE 0 END) AS numbers_of_sold_on_groundhog
FROM Date DD
INNER JOIN SalesRecord SR ON DD.date = SR.date
INNER JOIN Label L ON SR.pid = L.pid
INNER JOIN Category C ON L.categoryID = C.categoryID
WHERE C.category_name = 'Air Conditioner'
GROUP BY YEAR (DD.date)
ORDER BY YEAR (DD.date) ASC
;
/*View State with Highest Volume for each Category */
WITH CTE_Category 
AS (
SELECT C.category_name, City.state, SUM(SR.quantity) AS numbers_of_sold_by_category
FROM SalesRecord SR
INNER JOIN Label L ON L.pid = SR.pid
INNER JOIN Category C ON L.categoryID = C.categoryID
INNER JOIN Store S ON SR.storeID = S.storeID
INNER JOIN City ON City.cityID = S.CityID
WHERE YEAR(SR .date) = '2001' AND MONTH(SR.date) = '1'
GROUP BY C.category_name, City.state
)
, CTE_Category_Rank 
AS (
SELECT category_name, state, numbers_of_sold_by_category,
RANK () OVER (PARTITION BY category_name ORDER BY numbers_of_sold_by_category DESC) AS R
FROM CTE_Category
)
SELECT  
CCR.category_name,
CCR.state AS highest_sales_state,
numbers_of_sold_by_category AS total_units
FROM CTE_Category_Rank AS CCR 
WHERE R = 1
ORDER BY CCR.category_name ASC;


	/*Details*/
SELECT DISTINCT
S.store_number,
S.street_address AS store_address,
City.city,
MR.manager_name,
MR.email AS manager_email
FROM SalesRecord SR
INNER JOIN Label L ON SR.pid = L.pid
INNER JOIN Category C ON L.categoryID = C.categoryID
INNER JOIN Store S ON SR.storeID = S.storeID
INNER JOIN City ON City.cityID = S.cityID
LEFT JOIN Manage M ON S.storeID = M.storeID
LEFT JOIN ActiveManager MR ON MR.activeManagerID = M.activeManagerID
WHERE City.state = '$state name' AND C.category_name = '$category_name'
AND YEAR(SR.date) = '$year' AND MONTH(SR.date) = '$month'
ORDER BY S.store_number ASC;

/*View Revenue by Population */
WITH CTE_result AS (
SELECT 
YEAR(SR.date) AS sales_year,
CASE WHEN C.population < 3700000 THEN 'Small'
          WHEN C.population >= 3700000 AND C.population < 6700000 THEN 'Medium'
          WHEN C.population >= 6700000 AND C.population < 9000000 THEN 'Large'
          WHEN C.population >= 9000000 THEN 'Extra_Large'
END AS city_category,
SUM(SR.quantity * IFNULL(SLS.sale_price, P.retail_price)) AS revenue
FROM SalesRecord SR
INNER JOIN Product P ON P.pid = SR.pid
INNER JOIN Store S ON SR.storeID = S.storeID
INNER JOIN City C ON S.cityID = C.cityID
LEFT JOIN OnSale SLS ON SLS.date = SR.date AND SLS.pid = SR.pid
WHERE C.population IS NOT NULL
GROUP BY YEAR(SR.date),
CASE WHEN C.population < 3700000 THEN 'Small'
          WHEN C.population >= 3700000 AND C.population < 6700000 THEN 'Medium'
          WHEN C.population >= 6700000 AND C.population < 9000000 THEN 'Large'
          WHEN C.population >= 9000000 THEN 'Extra_Large'
END
)
SELECT sales_year, 
SUM(CASE WHEN city_category = 'Small' THEN revenue ELSE 0 END) AS Small,
SUM(CASE WHEN city_category = 'Medium' THEN revenue ELSE 0 END) AS Medium,
SUM(CASE WHEN city_category = 'Large' THEN revenue ELSE 0 END) AS Large,
SUM(CASE WHEN city_category = 'Extra_Large' THEN revenue ELSE 0 END) AS Extra_Large
FROM CTE_result 
GROUP BY sales_year
ORDER BY sales_year ASC;
