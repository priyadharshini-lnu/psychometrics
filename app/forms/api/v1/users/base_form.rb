# frozen_string_literal: true

module Api
  module V1
    module Users
      class BaseForm < Rectify::Form
        attribute %i[first_name last_name email gender], String
        attribute :campaigns, Array
        attribute :project_datasheet, Hash, default: {}
        attribute :user_external_id, String

        validates :first_name, presence: true
        validates :last_name, presence: true
        validates :email, presence: true
        validates :email, format: { with: Devise.email_regexp }

        validate :verify_campaign_ids
        validate :validate_campaigns
        validate :validate_project_datasheet_exists
        validate :validate_project_datasheet_data, if: -> { project_datasheet.present? && sheet }
        validates :user_external_id, length: { maximum: 128 }, allow_blank: true
        validate :uniq_user_external_id

        def uniq_user_external_id
          return if user_external_id.nil?

          query = ::User.where(project_id: context.project.id, external_id: user_external_id)
          query = query.where.not(id: user.id) if user

          if query.exists?
            errors.add(
              :external_id,
              I18n.t(
                'administration.api.users.form.external_id_taken',
                external_id: user_external_id
              )
            )
          end
        end

        def verify_campaign_ids
          return if campaign_ids.empty?
          return if (campaign_ids - existing_campaign_ids).empty?

          errors.add(
            :campaign_ids,
            I18n.t('administration.api.users.form.campaign_ids_not_existing')
          )
        end

        def validate_project_datasheet_exists
          return if project_datasheet.blank?

          errors.add(:project_datasheet, I18n.t('datasheet.errors.not_configured')) unless sheet
        end

        def validate_project_datasheet_data
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
