class BaseDecorator < Draper::Decorator
  delegate_all

  def status
    if object.disabled
      h.link_to '#' do
        h.content_tag(:i, '', class: 'fa fa-times')
      end
    else
      h.link_to '#' do
        h.content_tag(:i, '', class: 'fa fa-check')
      end
    end
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def updated_at
    I18n.l object.updated_at, format: :short
  end
end
