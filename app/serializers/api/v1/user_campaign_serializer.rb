# frozen_string_literal: true

module Api
  module V1
    class UserCampaignSerializer < Panko::Serializer
      attributes :id, :name, :active, :external_id, :schedule_start_date, :schedule_end_date, :created_at, :updated_at

      delegate :schedule_start_date, :active, :schedule_end_date,
               :external_id, to: :campaign_user, allow_nil: true

      private

      def user
        context[:user]
      end

      def campaign_user
        user&.campaign_users&.find_by(campaign_id: id)
      end
    end
  end
end
