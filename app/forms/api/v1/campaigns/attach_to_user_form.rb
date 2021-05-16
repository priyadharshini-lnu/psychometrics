# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class AttachToUserForm < Rectify::Form
        attribute :campaigns, Array

        validate :verify_campaign_ids
        validate :uniq_campaign_ids
        validate :validate_campaigns

        def verify_campaign_ids
          return if campaign_ids.empty?

          return if existing_campaign_ids & campaign_ids == campaign_ids

          errors.add(:campaign_ids, 'Not all campaign ids are existing')
        end

        def uniq_campaign_ids
          return if campaign_ids.empty?

          duplicated_ids = context.user.campaign_ids & campaign_ids
          return if duplicated_ids.empty?

          errors.add(:campaign_ids, "Following campaign ids already existed: #{duplicated_ids}")
        end

        def validate_campaigns
          errors.add(:campaigns, 'Should be at least one campaign') if campaigns.empty?

          campaigns.each.with_index do |campaign, index|
            form = ValidateForm.new(campaign)
            errors.add(:campaigns, "[Campaign #{index + 1}] #{form.errors.full_messages}") if form.invalid?
          end
        end

        def existing_campaign_ids
          @existing_campaign_ids ||= context.project.project_campaign_ids
        end

        def email
          context.user.email
        end

        def campaign_ids
          campaigns.map { |c| c[:id] }
        end
      end
    end
  end
end
