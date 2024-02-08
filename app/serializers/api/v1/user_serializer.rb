# frozen_string_literal: true

module Api
  module V1
    class UserSerializer < Panko::Serializer
      attributes :id, :first_name, :last_name, :email, :created_at, :updated_at, :campaigns, :campaign_ids

      def campaigns
        Panko::ArraySerializer.new(
          object.campaigns,
          each_serializer: UserCampaignSerializer
        ).to_a
      end

      def campaign_ids
        object.campaigns.map(&:id)
      end
    end
  end
end
