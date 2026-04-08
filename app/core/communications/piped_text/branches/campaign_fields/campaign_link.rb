# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module CampaignFields
        class CampaignLink < ::PipedText::BaseField
          include Rails.application.routes.url_helpers

          def call
            return broadcast(:ok, '') unless user

            text = params['text'] || 'Campaign Link'
            root = root_url(Utility::Url.get_params(subdomain: user.project.try(:subdomain)))
            broadcast :ok, "<a href='#{root}campaigns/#{params['campaign_id']}' target='_blank'>#{text}</a>"
          end

          def user
            context[:user]
          end
        end
      end
    end
  end
end
