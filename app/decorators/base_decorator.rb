class BaseDecorator < Draper::Decorator
  delegate_all

  def status
    if object.disabled
      h.content_tag(:i, '', class: 'fa fa-times')
    else
      h.content_tag(:i, '', class: 'fa fa-check')
    end
  end

  def status_text
    if object.disabled
      I18n.t('no')
    else
      I18n.t('yes')
    end
  end

  def toggle_status_text
    if object.disabled
      I18n.t('administration.enable')
    else
      I18n.t('administration.disable')
    end
  end

  # Common method for all entities
  # Return string
  def display_name
    object.name
  end

  def id
    "##{object.id}"
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def updated_at
    I18n.l object.updated_at, format: :short
  end
end
