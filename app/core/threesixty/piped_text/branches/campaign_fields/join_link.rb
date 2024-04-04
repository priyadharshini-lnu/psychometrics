# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module CampaignFields
        class JoinLink < ::PipedText::BaseField
          def call
            exp = Time.current.to_i + params['expire'].to_i
            token = ::Campaigns::JwtTokenizer.encode(
              { subject_id: context[:subject]&.id, campaign_id: params['campaign_id'], exp: exp }
            )

            broadcast :ok, "<a href='/campaigns/join_with_token?token=#{token}'>link</a>"
          end
        end
      end
    end
  end
end
