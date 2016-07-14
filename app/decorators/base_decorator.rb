class BaseDecorator < Draper::Decorator
  delegate_all

  def status
    h.content_tag(:i, '', class: 'fa fa-check') unless object.disabled
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def updated_at
    I18n.l object.updated_at, format: :short
  end
end
