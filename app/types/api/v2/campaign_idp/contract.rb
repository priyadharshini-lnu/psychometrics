# frozen_string_literal: true

module Api
  module V2
    module CampaignIdp
      class Contract < Api::Base::Contract
        config.messages.namespace = :campaign_idps

        rule(data: { relationships: :idp_template }) do
          idp_template_id = values.dig(:data, :relationships, :idp_template, :data, :id)
          idp_template = ::IdpTemplate.find_by(id: idp_template_id)

          unless idp_template&.status_published?
            key.failure(:idp_template_not_published)
          end
        end
      end
    end
  end
end
