# frozen_string_literal: true

module Threesixty
  class CampaignDecorator < BaseDecorator
    def name
      object.campaign.name
    end

    # FIXME
    def depth
      1
    end

    def delete_confirmation
      {
        title: I18n.t(
          'administration.clients.projects.threesixty_campaigns.resource.confirmations.delete.title',
          name: display_name
        ),
        body: I18n.t('administration.clients.projects.threesixty_campaigns.resource.confirmations.delete.body')[depth]
      }.to_json
    end
  end
end
