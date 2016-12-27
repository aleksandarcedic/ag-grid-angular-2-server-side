<?php
header("Access-Control-Allow-Origin: *");

/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/
?>
<?php
//sleep(2);

$hostname = 'localhost';

$username = 'some_user';

$password = 'some_pass';

try { $dbh = new PDO("mysql:host=$hostname;dbname=some_db", $username, $password); }

catch(PDOException $e) {    echo $e->getMessage();    }






// default number of rows per page
$limit = 10; 
if(isset($_GET['size'])){$limit = $_GET['size'];}

$page = $_GET['page'];
if($page){
	$start = ($page - 1) * $limit; 	
}else{
	$start = 0;
}





$sort = "id,desc";
if(isset($_GET['sort'])){$sort = $_GET['sort'];}
$useSort = str_replace(',',' ', $sort);

$quickFilter ="";
if (!empty($_GET['quickFilter'])) {

		$where = " WHERE ";
		$search = $_GET['quickFilter'];
		$keywords = explode (" ", $search);
		$columns = array("id", "first_name", "last_name");
		$andParts = array();
		foreach ($keywords AS $keyword){
		  $orParts = array();
			foreach($columns AS $column){
			  $orParts[] = $column . " LIKE '%" . $keyword . "%'";
			}
			$andParts[]= "(" . implode($orParts, " OR ") . ")";
		}
		$and = implode ($andParts, " AND ");
		$quickFilter = $where." (". $and.")";

}


$filterPerColumnArr = [];
if(!empty($_GET["filterPerColumn"])){

		/*
		equals
		notEqual   notEquals
		lessThan
		lessThanOrEqual
		greaterThan
		greaterThanOrEqual
		contains
		startsWith
		endsWith
		*/

		$filterPerColumnArr = json_decode($_GET["filterPerColumn"]);
		$filterPerColumnStrSum = [];
		foreach($filterPerColumnArr as $column){
			switch ($column->type) {
				case "equals":
					$filterPerColumnStr = $column->column." = '$column->filter'";
					break;
				case "notEqual":
					$filterPerColumnStr = $column->column." != '$column->filter'";
					break;
				case "notEquals":
					$filterPerColumnStr = $column->column." != '$column->filter'";
					break;
				case "lessThan":
					$filterPerColumnStr = $column->column." < '$column->filter'";
					break;
				case "lessThanOrEqual":
					$filterPerColumnStr = $column->column." <= '$column->filter'";
					break;
				case "greaterThan":
					$filterPerColumnStr = $column->column." > '$column->filter'";
					break;
				case "greaterThanOrEqual":
					$filterPerColumnStr = $column->column." >= '$column->filter'";
					break;
				case "contains":
					$filterPerColumnStr = $column->column." LIKE '%$column->filter%'";;
					break;
				case "startsWith":
					$filterPerColumnStr = $column->column." LIKE '$column->filter%'";
					break;
				case "endsWith":
					$filterPerColumnStr = $column->column." LIKE '%$column->filter'";
					break;
			}
			$filterPerColumnStrSum[] = $filterPerColumnStr;
		}
		if(substr($quickFilter, -1) == ")"){
			$quickFilter = $quickFilter . " AND " . implode(" AND ", $filterPerColumnStrSum);
		}else{
			$quickFilter = " WHERE " . implode(" AND ", $filterPerColumnStrSum);
		}
}



$countQuery = $dbh->prepare("SELECT id FROM authors $quickFilter");
$countQuery->execute();
// count number of records
$Records = $countQuery->rowCount();


$query = $dbh->prepare("SELECT id, first_name, last_name FROM authors $quickFilter ORDER BY $useSort LIMIT $start, $limit");
$query->execute();
$data = $query->fetchAll(PDO::FETCH_ASSOC);


$content = array(
  "data" => $data,
  "pageSize" => $limit,
  "pageNumber"=> $page,
  "totalElements"=> $Records,
  "totalPages"=> ceil($Records / $limit)
);

echo json_encode($content);

?>
