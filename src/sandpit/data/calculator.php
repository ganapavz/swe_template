<?php

	if ( $_GET[ 'calculator' ] === 'bond-loan' ) {

		// if there is an amount, display success message

		// income = _GET[income] // default?
		$income = $_GET[ 'income' ];
		// maximum weekly rent = income * 0.60
		$max_rent = $income * 0.6;
		// bond loan amount = max rent * 4
		$loan_amount = $max_rent * 4;

?>
	<div class="status info">
		<h2>Calculation…</h2>
		<p>
			Based on a total gross weekly income of <strong>$<?php echo $income ?></strong> 
			your maximum loan amount for a bond loan is <strong>$<?php echo $loan_amount ?></strong> 
			with a maximum weekly rent of <strong>$<?php echo $max_rent ?></strong>.
		</p>
	</div>


	<div class="calculator form">
		<form action="rental-bond.html" method="GET">
			<ol class="questions">
				<li>
					<label for="income">
						<span class="label">Enter your household total gross weekly income</span>
						<abbr title="(required)">*</abbr>
					</label>
					$<input id="income" name="income" size="10" required="required" value="<?php echo $income ?>" />
				</li>

				<li class="footer">
					<ul class="actions">
						<li><em><input type="submit" value="Calculate" /></em></li>
					</ul>
				</li>
			</ol>
		</form>
	</div>

<?php
	}

?>