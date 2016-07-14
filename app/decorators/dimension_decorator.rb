class DimensionDecorator < BaseDecorator
  def favourite
    h.content_tag(:i, '', class: 'fa fa-star') if object.favourite
  end
end
