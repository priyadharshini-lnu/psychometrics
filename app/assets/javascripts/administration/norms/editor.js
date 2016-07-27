$(function () {
    $.fn.editable.defaults.ajaxOptions = {type: "PUT"};

    function init() {

        $('.editable').editable({
            'type': 'text',
            'title': I18n.t('administration.norms.editor.inplace_title'),
            params: function (params) {
                var data = {};
                data[params.name] = params.value;
                return data;
            }
        });
    }
    init();
    $(document).on('initEditable', init);
});
