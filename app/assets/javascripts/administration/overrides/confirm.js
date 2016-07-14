"use strict";

$(document).ready(function () {

    //Override the default confirm dialog by rails
    $.rails.allowAction = function (link) {
        if (link.data("confirm") == undefined) {
            return true;
        }
        $.rails.showConfirmationDialog(link);
        return false;
    }

    //Display the confirmation dialog
    $.rails.showConfirmationDialog = function (link) {
        var modal = $('#mb-confirm').clone();
        if (link.data('title')) {
            modal.find('.mb-title-text').html(link.data('confirm-title'));
        }
        if (link.data('icon')) {
            modal.find('.mb-title-icon').removeClass().addClass('mb-title-icon fa ' + link.data('icon'));
        }
        if (link.data('confirm')) {
            modal.find('.mb-content').html(link.data('confirm'));
        }
        modal.toggleClass("open");
        if (modal.data("sound")) {
            playAudio(modal.data("sound"));
        }
        modal.find('.mb-confirm-yes').
            attr('href', link.attr('href')).
            data('method', link.data('method'));

        $('body').append(modal);
    }
});


