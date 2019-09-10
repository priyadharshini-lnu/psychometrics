# frozen_string_literal: true

class CommunicationDecorator < BaseDecorator
  def display_name
    object.subject
  end

  def author
    object.creator&.decorate&.display_name
  end

  def client_name
    object.client.name
  end

  def projects
    object.project&.name.presence || object.client.children.pluck(:name).join(', ')
  end

  def campaigns
    return object.campaign.name if object.campaign.present?

    Client.campaigns_of(object.end_level_id).pluck(:name).join(', ')
  end

  def sub_campaigns
    return object.sub_campaign.name if object.sub_campaign.present?

    Client.sub_campaigns_of(object.end_level_id).pluck(:name).join(', ')
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
