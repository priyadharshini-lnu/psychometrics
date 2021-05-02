# frozen_string_literal: true

module Api
  module V1
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_at, :updated_at, :campaigns, :campaign_ids

      def campaigns
        object.campaigns.map { |c| UserCampaignSerializer.new(c).to_h }
      end

      def campaign_ids
        object.campaigns.map(&:id)
      end
    end
  end
end
