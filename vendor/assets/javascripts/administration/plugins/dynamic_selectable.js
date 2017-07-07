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
        url = _this.constructUrl($select.val());
        if (url) {
          return $.getJSON(url, function(data) {
            $.each(data, function(index, el) {
              return _this.$targetSelect.append("<option value='" + el.id + "'>" + el.name + "</option>").selectpicker('refresh');
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
      content = '<option></option>';
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
