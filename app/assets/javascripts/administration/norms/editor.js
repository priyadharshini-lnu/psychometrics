$(function () {
    $.fn.editable.defaults.ajaxOptions = {type: "PUT"};

    $('.editable').editable({
        'type': 'text',
        id: 111,
        //'url': function (e) {
        //    console.log(111);
        //    return '/administration/factors_norms/3';
        //},
        //url: '/administration/factors_norms/2',
        'title': I18n.t('administration.norms.editor.inplace_title'),
        params: function (params) {

            console.log('params', params);
            var data = {};
            data.id = params.pk;
            data.pk = params.pk;
            data[params.name] = params.value;
            return data;
        }
    }).on('shown', function (e, editable) {
        editable.$element.attr('data-url', 'aaaa')
    });
});
