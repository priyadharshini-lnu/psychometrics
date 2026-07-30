# frozen_string_literal: true

module Api
  module V1
    module Users
      class CreateForm < BaseForm
        attribute :existing_record, String, default: 'reject'

        validates :first_name, presence: true
        validates :last_name, presence: true
        validates :email, presence: true
        validate :uniq_email, if: -> { existing_record != 'accept' && email.present? }

        def uniq_email
          return unless user

          raise Api::Errors::EmailExists.new(
            "Email address #{email} is already taken",
            existing_user: user.as_json(only: %w[id first_name last_name gender email created_at])
          )
        end

        def validate_campaigns
          return errors.add(:campaigns, 'Should be at least one campaign') if campaigns.blank?

          campaigns.each.with_index do |campaign, index|
            form = Api::V1::Campaigns::ValidateForm.new(campaign).with_context(user: user)
            errors.add(:campaigns, "[Campaign #{index + 1}] #{form.errors.full_messages}") if form.invalid?
          end
        end

        def active
          true
        end

        private

        def user
          @user ||= ::Users::Regular.find_by(email: email, project_id: context.project.id)
        end
      end
    end
  end
end
