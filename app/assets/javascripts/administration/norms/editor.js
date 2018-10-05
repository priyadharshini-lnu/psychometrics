$(function () {
    $.fn.editable.defaults.ajaxOptions = {type: "PUT"};

    function init() {

        $('.editable').editable({
            'type': 'text',
            'title': I18n.t('administration.norms.editor.inplace_title'),
            params: function (params) {
                var data = {};
                data['level'] = $(this).data('level');
                data['factor_id'] = $(this).data('factor');
                data['norm_id'] = $(this).data('norm');
                data['type'] = $(this).data('norm-type');
                data['field_name'] = params.name;
                data['field_value'] = params.value;
                return data;
            }
        });
    }
    init();
    $(document).on('initEditable', init);
});
