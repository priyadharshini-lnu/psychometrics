# frozen_string_literal: true

class CommunicationDecorator < BaseDecorator
  def display_name
    object.subject
  end

  def author
    object.created_by&.decorate&.display_name
  end

  def client_name
    object.client.name
  end

  def projects
    # TODO: (atanych) I don't understand this logic, but keeping as is for now
    object.project&.name.presence || object.client.children.pluck(:name).join(', ')
  end

  def campaigns
    object.project_campaign&.name
  end

  def form_url
    if object.new_record?
      helpers.new_form_administration_communications_path
    else
      helpers.edit_form_administration_communication_path(object)
    end
  end

  def kind
    object.kind_i18n
  end

  def recipients
    return I18n.t("admin.completion_recipients_#{object.recipients}") if object.completion?

    object.recipients_i18n
  end

  def show_recipient_users_list?
    object.selected_recipients? || object.selected_admins_recipients? || object.selected_assessors_recipients?
  end

  def users_list_label
    return I18n.t('admin.completion_recipients_list') if object.completion?

    I18n.t('administration.communications.show.users')
  end
end
