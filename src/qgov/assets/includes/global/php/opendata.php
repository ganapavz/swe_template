<?php
// NOTE:
// Before this can work Apache needs to be setup
// RewriteEngine on
// RewriteRule ^.*opendata\.swe{(.*)}$ /assets/includes/global/php/opendata.php?$1 [NE,NC]


$opendataUrl = 'https://data.qld.gov.au/api/action/datastore_search';
$assetDir = $_SERVER[ 'DOCUMENT_ROOT' ] . '/assets/includes/global';
$phpDir = $assetDir . '/php';
$templateDir = $assetDir . '/templates/opendata';

require_once($phpDir . '/libs/Mustache/Autoloader.php');
require_once($phpDir . '/libs/Parsedown.php');

Mustache_Autoloader::register();

$mustache = new Mustache_Engine(array(
	'loader' => new Mustache_Loader_FilesystemLoader($templateDir)
));


function getConfig() {
	$returnVal = array();
	if ($_GET && array_key_exists('config', $_GET)) {

		// Convert config from a string into its own associative array
		$configArray = explode(',', $_GET['config']);
		foreach ($configArray as $configVal) {
			$configPair = explode(':', $configVal);
			if ($configPair && array_key_exists(0, $configPair) && array_key_exists(1, $configPair)) {
				$returnVal[$configPair[0]] = $configPair[1];
			}
		}
	}

	return $returnVal;
}

function getQueryString() {
	$returnVal = array();
	if ($_GET) {
		foreach ($_GET as $k => $v) {
			if ($k !== 'config') {

				// Add to the array
				$returnVal[$k] = $v;
			}
		}
	}

	return $returnVal;
}

function getData($url) {
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_PROXY, '167.123.1.2');
	curl_setopt($ch, CURLOPT_PROXYPORT, '8008');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;
}

function parseRecord($record) {
	if ($record['Description']) {
		$Parsedown = new Parsedown();
		$record['Description'] = strip_tags($Parsedown->text($record['Description']));
	}
	return $record;
}

function getTemplateName($name, $params, $default) {
	$template = '';
	if ($name && $params) {
		$template = $default;
		if (array_key_exists($name, $params)) {

			// Test if template actually exists
			$fileExists = file_exists($GLOBALS['templateDir'] . '/' . $params[$name] . '.mustache');
			if ($fileExists) {
				$template = $params[$name];
			}
		}
	}
	return $template;
}

function buildHref($paramArray) {
	$queryArray = array_merge($GLOBALS['queryString'], $paramArray);
	$queryStr = '';
	foreach ($queryArray as $k => $v) {
		$queryStr .= ($queryStr) ? '&' : '';
		$queryStr .= "$k=$v";
	}

	return $queryStr;
}


// Assets
$globalAssetPath = 'https://www.qld.gov.au/assets/includes/global';
$globalAlert = getData("$globalAssetPath/global-alert.html");
$globalAside = getData("$globalAssetPath/global-aside.html");
$globalPageOptionsPost = getData("$globalAssetPath/page-options-post.html");


// Parse params
$config = getConfig();
$queryString = getQueryString();
// print '<pre>'; var_dump($config); print "</pre>";
// print '<pre>'; var_dump($queryString); print "</pre>";
$resource_id = (array_key_exists('resource_id', $config)) ? $config['resource_id'] : 0;
$limit = (array_key_exists('limit', $config)) ? $config['limit'] : 10;
$offset = (array_key_exists('start', $queryString)) ? $queryString['start'] : 0;
$contentTemplate = getTemplateName('content_template', $config, 'content');
$searchTemplate = getTemplateName('search_template', $config, 'search');
$asideTemplate = getTemplateName('aside_template', $config, 'aside');
$propertiesTemplate = getTemplateName('properties_template', $config, 'aside');

// Fetch data
$opendata = getData("$opendataUrl?resource_id=$resource_id&limit=$limit&offset=$offset");
//TODO: handle failures
//TODO: handle no results
//TODO: handle rouge QUERY STRINGS
$opendata = ($opendata) ? json_decode($opendata, true) : '';

if (array_key_exists('result', $opendata)) {
	$opendata = $opendata['result'];
	$pagination = array();

	$offset = (array_key_exists('offset', $opendata)) ? $opendata['offset'] : 0;
	$limit = (array_key_exists('limit', $opendata)) ? $opendata['limit'] : 0;
	$total = (array_key_exists('total', $opendata)) ? $opendata['total'] : 0;

	if ($total) {
		$opendata['records'] = array_map('parseRecord', $opendata['records']);
		$opendata['resultStart'] = $opendata['offset'] + 1;
		$opendata['resultEnd'] = $opendata['offset'] + $opendata['limit'];
		if ($total && $opendata['resultEnd'] > $total) {
			$opendata['resultEnd'] = $total;
		}

		// Previous
		if ($offset) {
		$prev = $offset - $limit;
		$prev = ($prev < 0) ? 0 : $prev;
		$pagination['prev'] = '?' . buildHref(array('start'=>$prev));
		}

		// Page number
		$currentPage = ceil($offset / $limit) + 1;
		$totalPages = ceil($total / $limit);
		$pagination['pageNumber'] = "Page $currentPage of $totalPages";

		// Next
		if ($opendata['resultEnd'] < $total) {
			$next = $opendata['resultEnd'];
			$next = ($next >= $total) ? $opendata['resultEnd'] + 1 : $next;
			$pagination['next'] = '?' . buildHref(array('start'=>$next));
		}

		$opendata['pagination'] = $pagination;
	}

}

// Generate html
$data = array_merge($opendata, array(
	'globalAlert'	=> $globalAlert,
	'title'			=> $config['title']));
$content = $mustache->render($contentTemplate, $data);
$aside = $mustache->render($asideTemplate, array(
	'globalAside'	=> $globalAside,
	'search'		=> $searchTemplate));
$properties = $mustache->render($propertiesTemplate, array('globalPageOptionsPost'=>$globalPageOptionsPost));
print "$content $aside $properties";
?>