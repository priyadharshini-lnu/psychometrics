# frozen_string_literal: true

class BaseDecorator < Draper::Decorator
  delegate_all

  # Common method for all entities
  # Return string
  def display_name
    object.name
  end

  def html_escaped_display_name
    h.html_escape(display_name)
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

  def toggle_archive_status_text
    if object.archived
      'Unarchive'
    else
      'Archive'
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

  def formatted_date_time(column_name)
    object[column_name].nil? ? I18n.t('.na') : (I18n.l object[column_name], format: :short)
  end

  def delete_confirmation
    {
      title: I18n.t("administration.#{i18n}.resource.confirmations.delete.title", name: html_escaped_display_name),
      body: I18n.t("administration.#{i18n}.resource.confirmations.delete.body")
    }.to_json
  end

  def soft_delete_confirmation
    {
      title: I18n.t("administration.#{i18n}.resource.confirmations.soft_delete.title", name: html_escaped_display_name),
      body: I18n.t("administration.#{i18n}.resource.confirmations.soft_delete.body")
    }.to_json
  end

  def archive_confirmation
    {
      title: I18n.t("administration.#{i18n}.resource.confirmations.archive.title", name: html_escaped_display_name),
      body: I18n.t("administration.#{i18n}.resource.confirmations.archive.body")
    }.to_json
  end

  def toggle_status_confirmation
    status = object.disabled ? I18n.t('administration.enable') : I18n.t('administration.disable')
    {
      title: I18n.t(
        "administration.#{i18n}.resource.confirmations.toggle_status.title",
        status: status,
        name: html_escaped_display_name
      ),
      body: I18n.t(
        "administration.#{i18n}.resource.confirmations.toggle_status.body",
        status: status.downcase
      )
    }.to_json
  end

  def toggle_archive_confirmation
    status = object.archived ? 'Unarchive' : 'Archive'
    {
      title: I18n.t(
        "administration.#{i18n}.resource.confirmations.toggle_status.title",
        status: status,
        name: html_escaped_display_name
      ),
      body: I18n.t(
        "administration.#{i18n}.resource.confirmations.toggle_status.body",
        status: status.downcase
      )
    }.to_json
  end

  def owner_link
    if object.owner_id
      url = "/admin/clients/#{object.owner_id}/projects"
      helpers.link_to(object.owner.name, url)
    else
      I18n.t('admin.platform_owner')
    end
  end

  def creator_name
    h.content_tag(:span, object.creator&.decorate&.display_name, class: 'text-nowrap')
  end

  def modifier_name
    h.content_tag(:span, object.modifier&.decorate&.display_name, class: 'text-nowrap')
  end

  def i18n
    object.class.model_name.plural
  end
end
