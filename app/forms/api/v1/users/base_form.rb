# frozen_string_literal: true

module Api
  module V1
    module Users
      class BaseForm < Rectify::Form
        attribute %i[first_name last_name email], String
        attribute :campaigns, Array
        attribute :project_datasheet, Hash, default: {}

        validates :first_name, presence: true
        validates :last_name, presence: true
        validates :email, presence: true
        validates :email, format: { with: Devise.email_regexp }

        validate :verify_campaign_ids
        validate :validate_campaigns
        validate :validate_project_datasheet_exists
        validate :validate_project_datasheet

        def verify_campaign_ids
          return if campaign_ids.empty?
          return if (campaign_ids - existing_campaign_ids).empty?

          errors.add(
            :campaign_ids,
            I18n.t('administration.api.users.form.campaign_ids_not_existing')
          )
        end

        def validate_project_datasheet_exists
          unless sheet
            errors.add(:project_datasheet, I18n.t('datasheet.errors.not_configured'))
          end
        end

        def validate_project_datasheet
          return if project_datasheet.blank?

          form = Api::V1::Sheets::UpsertRowForm.new({
            data: project_datasheet
          }).with_context(sheet: sheet)

          errors.add(:project_datasheet, form.errors.full_messages) if form.invalid?
        end

        private

        def campaign_ids
          campaigns.pluck('id')
        end

        def existing_campaign_ids
          @existing_campaign_ids ||= context.project.project_campaign_ids
        end

        def project
          context[:project]
        end

        def sheet
          @sheet ||= context[:project].datasheet
        end
      end
    end
  end
end
