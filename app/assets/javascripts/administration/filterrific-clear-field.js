$(function() {
    $('.has-clear input').on('keyup', function() {
        if ($(this).val() == '') {
            $(this).parents('.form-group').addClass('has-empty-value');
        } else {
            $(this).parents('.form-group').removeClass('has-empty-value');
        }
    }).trigger('keyup');

    $('.has-clear .form-control-clear').on('click', function() {
        var $input = $(this).parents('.form-group').find('input');

        $input.val('').trigger('keyup');
    });
});
