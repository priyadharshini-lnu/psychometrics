class BaseDecorator < Draper::Decorator
  delegate_all

  # Common method for all entities
  # Return string
  def display_name
    object.name
  end

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

  def id
    "##{object.id}"
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def updated_at
    I18n.l object.updated_at, format: :short
  end

  def delete_confirmation
    {
        title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.title", name: display_name),
        body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.body")
    }.to_json
  end

  def archive_confirmation
    {
        title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.archive.title", name: display_name),
        body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.archive.body")
    }.to_json
  end

  def toggle_status_confirmation
    status = object.disabled ? I18n.t('administration.enable') : I18n.t('administration.disable')
    {
        title: I18n.t(
            "administration.#{object.class.model_name.plural}.resource.confirmations.toggle_status.title",
            status: status,
            name: display_name
        ),
        body: I18n.t(
            "administration.#{object.class.model_name.plural}.resource.confirmations.toggle_status.body",
            status: status.downcase
        )
    }.to_json
  end

  def client_name
    if object.owner_id
      helpers.link_to(object.owner.name, helpers.administration_client_users_path(object.owner_id))
    else
      I18n.t('administration.tte')
    end
  end

  def creator_name
    h.content_tag(:span, object.creator&.decorate&.display_name, class: 'text-nowrap')
  end

  def modifier_name
    h.content_tag(:span, object.modifier&.decorate&.display_name, class: 'text-nowrap')
  end
end
