$("#nav-link-2").click(function () {
    if ($("#nav-link-2").hasClass("non-active")) {
        $("#week-anchor").submit();
    }
});

$("#nav-link-1").click(function () {
    if ($("#nav-link-1").hasClass("non-active")) {
        $("#today-anchor").submit();
    }
});

$("#trashbin").click(function() {
    $("#clearForm").submit();
});

$(".form-check-input").change(function() {
    $("#checkboxForm input[name=id]").val($(this).attr("id"));

    let currentStat = $(".active-stat").text();
    let words = currentStat.split("/");
    var attr = $(this).attr('checked');
    if (typeof attr !== 'undefined' && attr !== false)
        $(".active-stat").text = ++words[0] + "/" + words[1];
    else 
        $(".active-stat").text = --words[0] + "/" + words[1];
    
    $("#checkboxForm").submit();
});

$(".delete-task").click(function() {
    $("#deleteForm input[name=id]").val(($(this).attr("id")).slice(1));
    $("#deleteForm").submit();
});

function validationClear(obj) {
    var textfield = $(obj).get(0);
    textfield.setCustomValidity('');
}

$("form input[name=newItemHeading]").on('change invalid', function() {
    var textfield = $(this).get(0);
    textfield.setCustomValidity('');
    if (!textfield.validity.valid) {
      textfield.setCustomValidity("Fill the heading field!");  
    }
});