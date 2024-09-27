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
end
