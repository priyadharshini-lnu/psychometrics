# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module CampaignFields
        class JoinLink < ::PipedText::BaseField
          include Rails.application.routes.url_helpers

          def call
            return broadcast(:ok, '') unless user

            exp = Time.current.to_i + params['expiry'].to_i
            text = params['text'] || 'Join Campaign'
            token = ::Campaigns::JwtTokenizer.encode(
              { subject_id: user.id, campaign_id: params['campaign_id'], exp: exp }
            )

            root = root_url(Utility::Url.get_params(subdomain: user.project.try(:subdomain)))
            broadcast :ok, "<a href='#{root}campaigns/join_with_token?token=#{token}' target='_blank'>#{text}</a>"
          end

          def user
            context[:user]
          end
        end
      end
    end
  end
end
