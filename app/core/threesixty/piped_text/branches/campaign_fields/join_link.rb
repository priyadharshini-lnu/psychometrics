# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module CampaignFields
        class JoinLink < ::PipedText::BaseField
          include Rails.application.routes.url_helpers

          def call
            return broadcast(:ok, '') unless context[:subject]

            exp = Time.current.to_i + params['expire'].to_i

            token = ::Campaigns::JwtTokenizer.encode(
              { subject_id: context[:subject].id, campaign_id: params['campaign_id'], exp: exp }
            )
            root = root_url(Utility::Url.get_params(subdomain: context[:subject].project.try(:subdomain)))
            broadcast :ok, "<a href='#{root}campaigns/join_with_token?token=#{token}'>link</a>"
          end
        end
      end
    end
  end
end
