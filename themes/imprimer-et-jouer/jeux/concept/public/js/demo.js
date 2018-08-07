$(document).ready(function() {

    $( '#open-menu button' ).click(function() {
        $( "#toggle" ).toggle('slide', {direction : "right"}, 500);
    });

    $( '#close-menu button' ).click(function() {
        $( "#toggle" ).toggle('slide', {direction : "right"}, 500);
    });
});