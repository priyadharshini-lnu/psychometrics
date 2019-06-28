var DynamicSelectable;

$.fn.extend({
  dynamicSelectable: function() {
    return $(this).each(function(i, el) {
      return new DynamicSelectable($(el));
    });
  }
});

DynamicSelectable = (function() {
  function DynamicSelectable($select) {
    this.init($select);
  }

  DynamicSelectable.prototype.init = function($select) {
    this.urlTemplate = $select.data('dynamicSelectableUrl');
    this.$targetSelect = $($select.data('dynamicSelectableTarget'));
    this.include_blank = $select.data('includeBlank');
    return $select.on('change', (function(_this) {
      return function() {
        var url;
        _this.clearTarget();
        var $options =  $select.find('option:selected');
        var values = $.map($options ,function(option) {
          return option.value;
        });

        values = $select.prop('multiple') ? values : values[0];

        url = _this.constructUrl(values);
        if (url) {
          return $.getJSON(url, function(data) {
            $.each(data, function(index, el) {
              var selected = '';
              if (el.selected) {
                selected = 'selected';
              }
              var disabled = '';
              if (el.disabled) {
                disabled = 'disabled';
              }
              var multiple = '';
              if (el.multiple !== undefined) {
                multiple = "data-multiple='" + el.multiple + "' ";
              }

              return _this.$targetSelect.append("<option " + multiple +
                "value='" + el.id + "' " + selected + " " + disabled + ">" +
                el.name + "</option>").selectpicker('refresh');
            });
            return _this.reinitializeTarget();
          });
        } else {
          return _this.reinitializeTarget();
        }
      };
    })(this));
  };

  DynamicSelectable.prototype.reinitializeTarget = function() {
    this.$targetSelect.selectpicker('refresh');
    return this.$targetSelect.trigger("change");
  };

  DynamicSelectable.prototype.clearTarget = function() {
    var content = '';
    if (this.include_blank) {
      title = typeof(this.include_blank) == 'string' ? this.include_blank : ''
      content = '<option title="' + title + '"></option>';
    }
    return this.$targetSelect.html(content);
  };

  DynamicSelectable.prototype.constructUrl = function(id) {
    if (id && id !== '') {
      return this.urlTemplate.replace(/__id__/, id);
    }
  };

  return DynamicSelectable;

})();
