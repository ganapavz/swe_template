(function( $ ) {

  var waitingForBpoint = false;

  // when submitting to bpoint (the 'Pay now' button is clicked)
  $( '#pay' ).filter( '[value="Pay now"]' ).closest( 'form' ).submit(function() {
     waitingForBpoint = true;
  });


function countdown() {
  var left = parseInt(timeoutLeft);
  var hoursLeft = (left - left % 3600) / 3600;
  left = left - (hoursLeft * 3600);
  var secondsLeft = left % 60;
  var minutesLeft = (left - secondsLeft) / 60;

  var time = "("
  if (hoursLeft > 0) {
    time = time + hoursLeft  + " hours, "
  }

  if (minutesLeft > 0) {
    time = time + minutesLeft  + " minutes"
    if(hoursLeft < 1){
     time = time + ","
    }
    time = time + " "
  }
  if (hoursLeft < 1) {
    time = time + secondsLeft % 60  + " seconds "
  }
  time = time + "remaining)"

  if (timeoutLeft === 60) {
    time = "(60 seconds remaining)";
  }

  if (timeoutLeft <= 0) {
    time = "(0 seconds remaining)";
  }

  document.getElementById("timeLeft").innerHTML = time;

  if (left === 0 ) {
    if ( waitingForBpoint !== true ) {
        if ( showLightBox ) {
            $( document ).status( 'show', {
              status : 'info',
              lightbox : true,
              title : messageTitle,
              body : messageContent + '<ol class="actions"><li><strong><a href="' + timeoutUrl + '" id="re-order" class="button">Re-order</a></strong></li><li><a href="javascript:history.go(-1)">Close</a></li></ol>',
              callbackPostClose : function() {
                location.reload();
              }
            });
        } else {
            location.reload();
        }
    }
  } else {
    timeoutLeft--;

    // check again in 1 second
    setTimeout(countdown, 1000);
  }

}

// run immediately();
countdown();

}( jQuery ));