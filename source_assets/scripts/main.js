$(function() {
  $('#section-switch a').click(function(e) {
    e.preventDefault();
    
    // Remove all actives.
    $('#section-switch li').removeClass('active');
    // Activate current.
    $(this).parent('li').addClass('active');
    
    // Hide all content.
    $('.tab-content').addClass('hidden');
    //Show clicked
    var dest = $(this).attr('href');
    $(dest).removeClass('hidden');
  });
});