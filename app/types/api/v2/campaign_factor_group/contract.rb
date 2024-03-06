# frozen_string_literal: true

module Api
  module V2
    module CampaignFactorGroup
      class Contract < Api::Base::Contract
        config.messages.namespace = :campaign_factor_group
        schema Api::V2::CampaignFactorGroup::Schema.create_request

        rule(data: { attributes: :name }) do
          same_name_groups = ::CampaignFactorGroup.where(campaign_id: _context[:params][:campaign_id], name: value)
          same_name_groups = same_name_groups.where.not(id: _context[:params][:id]) if _context[:params][:id]
          if same_name_groups.exists?
            key.failure(:group_already_exists)
          end
        end
      end
    end
  end
end
