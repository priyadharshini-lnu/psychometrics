# frozen_string_literal: true

module Threesixty
  class CampaignDecorator < BaseDecorator
    def name
      object.campaign.name
    end

    def delete_confirmation
      {
        title: I18n.t(
          'administration.clients.projects.threesixty_campaigns.resource.confirmations.delete.title',
          name: display_name
        ),
        body: I18n.t('administration.clients.projects.threesixty_campaigns.resource.confirmations.delete.body')
      }.to_json
    end
  end
end
