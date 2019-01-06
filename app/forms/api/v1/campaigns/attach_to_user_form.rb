module Api
  module V1
    module Campaigns
      class AttachToUserForm < Rectify::Form
        attribute :campaign_ids,  Array
        attribute :project,  Client
        attribute :user,  User
        validate :verify_campaign_ids
        validate :uniq_campaign_ids

        def verify_campaign_ids
          return if campaign_ids.empty?

          return if existing_campaign_ids & campaign_ids == campaign_ids

          errors.add(:campaign_ids, 'Not all campaign ids are existing')
        end

        def uniq_campaign_ids
          return if campaign_ids.empty?

          duplicated_ids = user.memberships.map(&:client_id) & campaign_ids
          return if duplicated_ids.empty?

          errors.add(:campaign_ids, "Follow campaign ids already existed: #{duplicated_ids}")
        end

        def existing_campaign_ids
          @existing_campaign_ids ||= Client.campaigns_and_sub_campaigns_of(project.id).ids
        end
      end
    end
  end
end
