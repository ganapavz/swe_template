<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-AU" lang="en-AU">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<?php
	
	require_once( $_SERVER[ 'DOCUMENT_ROOT' ] . '/assets/lib/init.php' );


	// libraries
	require_once( 'data/sanitise.php' );
	require_once( 'data/style.php' );
	require_once( 'data/csv.php' );

	$category = 'Consumer Goods and Services';
	if ( isset( $_GET[ 'category' ])) {
		$category = $_GET[ 'category' ];
	}
 
	$title = xhtml( $category );


	$dataset = fopen( $_SERVER[ 'DOCUMENT_ROOT' ] . '/assets/data/business-discount-directory-categories.csv', 'r' );
	$headers = fgetcsv( $dataset );

	// init array for results
	$results = array();

	// loop through CSV data
	while (( $csv = fgetcsv( $dataset )) !== false ) {
		// extract data
		$i = 0;

		// ignore blank entries
		if ( strlen( trim( $csv[ $i ] )) > 0 ) {

			$data = array();
			foreach ( $headers as $key ) {
				// do not overwrite
				// this will ignore the private contact fields at end of csv
				if ( ! isset( $data[ $key ] ) && $i < count( $csv )) {
					$data[ $key ] = trim( $csv[ $i ] );
				}
				$i++;
			}

			// matches search filters?
			$matchAllCriteria = true;

			if ( $category != $data[ 'ParentCategory (BS)' ]) {
				$matchAllCriteria = false;
			}

			if ( $matchAllCriteria ) {
				// store it
				array_push( $results, $data );
			}
		}
	}
?>

	<title><?php echo $title ?> | Seniors | Queensland Government</title>


<!--#set var="franchise" value="seniors"-->
<!--#set var="title" value="<?php echo $title ?>"-->


<?php virtual( '/assets/includes/global/head-assets.html' ) ?>

	<link rel="schema.DCTERMS" href="http://purl.org/dc/terms/" />
	<link rel="schema.AGLSTERMS" href="http://www.agls.gov.au/agls/terms/" />

	<meta name="DCTERMS.creator" scheme="AGLSTERMS.GOLD" content="c=AU; o=The State of Queensland; ou=DEPARTMENT NAME; ou=UNIT NAME" />
	<meta name="DCTERMS.publisher" scheme="AGLSTERMS.AglsAgent" content="corporateName=The State of Queensland; jurisdiction=Queensland" />
	<meta name="DCTERMS.created" content="2012-09-13" />
	<meta name="DCTERMS.modified" content="2012-09-13" />

	<meta name="DCTERMS.title" content="<?php echo $title ?>" />
	<!-- TODO NEED GUIDANCE ON DESCRIPTION FOR INDEX PAGES! -->
	<meta name="DCTERMS.description" content="<?php echo $title ?>" />
	
<?php virtual( '/assets/includes/global/head-meta-identifier.html' ) ?>
	<meta name="DCTERMS.type" scheme="DCTERMS.DCMIType" content="Collection" />
	<meta name="AGLSTERMS.aggregationLevel" content="collection"/>
	<meta name="AGLSTERMS.documentType" scheme="AGLSTERMS.agls-document" content="index" />
	<meta name="DCTERMS.audience" scheme="AGLSTERMS.agls-audience" content="seniors" />
	<meta name="DCTERMS.jurisdiction" scheme="AGLSTERMS.AglsJuri" content="Queensland" />
	<meta name="DCTERMS.license" scheme="DCTERMS.URI" content="https://creativecommons.org/licenses/by/4.0/" />

</head>

<body id="qld-gov-au" class="residents theme-index-with-asides">

<?php virtual( '/assets/includes/global/header.html' ) ?>	
	
	<div id="page-container"><div class="max-width">
		<div id="breadcrumbs">
			<h2>You are here:</h2>
			<ol>
<?php virtual( '/assets/includes/global/breadcrumb-citizen.html' ) ?>
				<li><a href="/seniors/">Seniors</a></li>
				<li><a href="/seniors/legal-finance-concessions">Legal, finance and concessions</a></li>
				<li><a href="/seniors/legal-finance-concessions/seniors-card/">Seniors Card</a></li>
<?php if ( isset( $childCategory )) { ?>
				<li><a href="./">Search for discounts</a></li>
				<li><?php echo xhtmlLink( './?category=' . $category, $category ) ?></a></li>
				<li class="last-child"><?php echo $childCategory ?></li>
<?php } elseif ( isset( $category )) { ?>
				<li><a href="./">Search for discounts</a></li>
				<li class="last-child"><?php echo $category ?></li>
<?php } else { ?>
				<li class="last-child">Search for discounts</li>
<?php } ?>
			</ol>
		</div>
	
		<div id="content-container">
			<div id="content">
				<div class="article"><div class="box-sizing"><div class="border">
<?php virtual( '/assets/includes/global/global-alert.html' ) ?>

					<h1><?php echo $title ?></h1>

<?php virtual( '/assets/includes/global/page-options-pre.html' ) ?>

					<div class="section" id="ia">
						<ul>
<?php foreach ( $results as $data ) { ?>
							<li class="d1"><h2><a href="../?<?php echo http_build_query(array( 'category' => $data[ 'ParentCategory (BS)' ], 'childCategory' => $data[ 'ChildCategory (BS)' ])) ?>">
									<span class="link-text"><?php echo $data[ 'ChildCategory (BS)' ] ?></span>
									<img src="<?php echo xhtml( $data[ 'Thumbnail' ]) ?>" alt="" />
								</a></h2>
								<p><?php echo $data[ 'Description' ] ?></p>
							</li>
<?php } ?>
						</ul>
					</div><!-- end #ia -->
					
					<div id="asides">
						<?php virtual( '/assets/includes/global/global-aside.html' ) ?>


						<!-- TODO featured items within category? -->
						<div class="aside tip">
							<h2>Albion Appliance Service P/L</h2>
							<p>15% off service calls. Excludes dishwashers.</p>
						</div>

						<div class="aside tip">
							<h2>Mister Minit</h2>
							<p>10% off shoe, key, engraving &amp; watch services. Excl. spec.</p>
						</div>

						<div class="aside tip">
							<h2>Jeays Hardware P/L (Mitre 10)</h2>
							<p>5% off retail prices. Excludes specials. Cash only.</p>
						</div>


					</div><!-- end #asides -->

				</div></div></div><!-- end .article .box-sizing .border -->
			</div><!-- end #content -->

			<div id="meta-wrapper"><div class="meta-box-sizing"><div class="border">

				<div id="document-properties"><div class="box-sizing">
					<dl>
						<dt>Last updated</dt>
						<dd>13 September 2012</dd>
					</dl>
				</div></div>


<?php virtual( '/assets/includes/global/page-options-post.html' ) ?>


			</div></div></div><!-- end #meta-wrapper, .meta-box-sizing, .border -->

		</div><!-- end #content-container -->
		
	
	
<div id="nav-section">
	<div class="box-sizing">
<?php if ( isset( $childCategory )) { ?>
		<h2><a href="./category=">Consumer Goods and Services</a></h2>
		<ul>
			<li><a href="../category=">Electrical Goods - Repairs and Services</a></li>
			<li><a href="../category=">Hardware and Tool Supplies</a></li>
			<li><a href="../category=">Key Cutting and Engraving</a></li>
			<li><a href="../category=">Refrigeration - Sales and Services</a></li>
			<li><a href="../category=">Watches and Clocks - Sales and Services</a></li>
		</ul>
<?php } elseif ( isset( $category )) { ?>
		<h2><a href="./">Search for discounts</a></h2>
		<ul>
			<li><a href="./?category=Accommodation">Accommodation</a></li>
			<li><a href="./?category=Arts, Crafts and Hobbies">Arts, Crafts and Hobbies</a></li>
			<li><a href="./?category=Automotive">Automotive</a></li>
			<li><a href="./?category=Books, Magazines and Newsagents">Books, Magazines and Newsagents</a></li>
			<li><a href="./?category=Clothing, Fabrics, Accessories and Services">Clothing, Fabrics, Accessories and Services</a></li>
			<li><a href="./?category=Computers">Computers</a></li>
			<li><a href="./?category=Consumer Goods and Services">Consumer Goods and Services</a></li>
			<li><a href="./?category=Entertainment, Events and Venues">Entertainment, Events and Venues</a></li>
			<li><a href="./?category=Financial Services">Financial Services</a></li>
			<li><a href="./?category=Food, Drink Suppliers and Services">Food, Drink Suppliers and Services</a></li>
			<li><a href="./?category=Health and Medical Products and Services">Health and Medical Products and Services</a></li>
			<li><a href="./?category=Office and Business - Supplies and Services">Office and Business - Supplies and Services</a></li>
			<li><a href="./?category=Security">Security</a></li>
			<li><a href="./?category=Travel">Travel</a></li>
		</ul>
<?php } else { ?>
		<h2><a href="/seniors/legal-finance-concessions/seniors-card/">Seniors Card</a></h2>
		<ul>
			<li><a href="/seniors/legal-finance-concessions/applying-seniors-card/">Applying for a Seniors Card</a></li>
			<li><a href="./">Search for discounts</a></li>
			<li><a href="/seniors/legal-finance-concessions/using-seniors-card/">Using your Seniors Card</a></li>
			<li><a href="/seniors/legal-finance-concessions/senior-shopper/">Senior Shopper</a></li>
			<li><a href="/seniors/legal-finance-concessions/managing-seniors-card/">Update, replace or cancel a card</a></li>
			<li><a href="http://www.communities.qld.gov.au/communityservices/seniors/seniors-card/for-businesses">For businesses</a></li>
		</ul>
<?php } ?>
	</div>
</div>



	</div></div><!-- end #page-container, .max-width -->


<?php virtual( '/assets/includes/global/footer.html' ) ?>


</body>
</html>
