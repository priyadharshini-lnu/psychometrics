# frozen_string_literal: true

module Api
  module V1
    module Users
      class UpdateForm < BaseForm
        validate :uniq_email

        validates :first_name, presence: true, if: -> { context.passed_attributes.include?(:first_name) }
        validates :last_name, presence: true, if: -> { context.passed_attributes.include?(:last_name) }
        validates :email, presence: true, if: -> { context.passed_attributes.include?(:email) }

        def uniq_email
          return if email.nil?
          return if email == context.user.email
          return unless ::Users::Regular.exists?(email: email, project_id: context.project.id)

          raise Api::Errors::EmailExists, "Email address #{email} is already taken"
        end

        def validate_campaigns
          return if campaigns.blank?

          campaigns.each.with_index do |campaign, index|
            form = Api::V1::Campaigns::ValidateForm.new(campaign).with_context(user: context.user)
            errors.add(:campaigns, "[Campaign #{index + 1}] #{form.errors.full_messages}") if form.invalid?
          end
        end

        delegate :user, to: :context
      end
    end
  end
end
