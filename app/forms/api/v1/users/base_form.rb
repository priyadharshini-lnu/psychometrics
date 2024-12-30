# frozen_string_literal: true

module Api
  module V1
    module Users
      class BaseForm < Rectify::Form
        attribute %i[first_name last_name email], String
        attribute :campaigns, Array

        validates :first_name, presence: true
        validates :last_name, presence: true
        validates :email, presence: true
        validates :email, format: { with: Devise.email_regexp }

        validate :verify_campaign_ids
        validate :validate_campaigns

        def verify_campaign_ids
          return if campaign_ids.empty?
          return if (campaign_ids - existing_campaign_ids).empty?

          errors.add(
            :campaign_ids,
            I18n.t('administration.api.users.form.campaign_ids_not_existing')
          )
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
