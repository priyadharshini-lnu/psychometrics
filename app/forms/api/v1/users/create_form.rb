# frozen_string_literal: true

module Api
  module V1
    module Users
      class CreateForm < Rectify::Form
        attribute %i[first_name last_name email], String
        attribute :existing_record, String, default: 'reject'
        attribute :campaigns, Array

        validates :first_name, presence: true
        validates :last_name, presence: true
        validates :email, presence: true
        validates :email, format: { with: Devise.email_regexp }
        validate :uniq_email, if: -> { existing_record != 'accept' && email.present? }
        validate :verify_campaign_ids
        validate :validate_campaigns

        def uniq_email
          user = ::Users::Regular.find_by(email: email, project_id: context.project.id)
          return unless user

          raise Api::Errors::EmailExists.new(
            "Email address #{email} is already taken",
            existing_user: user.as_json(only: %w[id first_name last_name email created_at])
          )
        end

        def verify_campaign_ids
          return if campaign_ids.empty?
          return if existing_campaign_ids & campaign_ids == campaign_ids

          errors.add(:campaign_ids, 'Not all campaign ids are existing')
        end

        def validate_campaigns
          return errors.add(:campaigns, 'Should be at least one campaign') if campaigns.blank?

          campaigns.each.with_index do |campaign, index|
            form = Api::V1::Campaigns::ValidateForm.new(campaign)
            errors.add(:campaigns, "[Campaign #{index + 1}] #{form.errors.full_messages}") if form.invalid?
          end
        end

        def active
          true
        end

        def campaign_ids
          campaigns.pluck(:id)
        end

        private

        def existing_campaign_ids
          @existing_campaign_ids ||= context.project.project_campaign_ids
        end
      end
    end
  end
end
