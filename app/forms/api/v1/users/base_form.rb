# frozen_string_literal: true

module Api
  module V1
    module Users
      class BaseForm < Rectify::Form
        attribute %i[first_name last_name email gender locale], String
        attribute :campaigns, Array
        attribute :project_datasheet, Hash, default: {}
        attribute :user_external_id, String
        attribute :custom_profile_fields, Hash, default: {}

        validates :gender, inclusion: { in: UserProfile.genders.keys }, allow_blank: true
        validates :email, format: { with: Devise.email_regexp }, allow_blank: true

        validate :verify_campaign_ids
        validate :validate_campaigns
        validate :validate_project_datasheet_exists
        validate :validate_project_datasheet_data, if: -> { project_datasheet.present? && sheet }
        validates :user_external_id, length: { maximum: 128 }, allow_blank: true
        validate :uniq_user_external_id
        validate :validate_locale, if: -> { locale.present? }
        validate :validate_custom_profile_fields, if: -> { custom_profile_fields.present? }

        def resolved_custom_profile_fields
          return {} if custom_profile_fields.blank?

          profile_fields_with_questions = project.profile_setting.profile_fields.includes(:question)
          custom_profile_fields.each_with_object({}) do |(question_text, value), result|
            field = find_profile_field_by_question_text(profile_fields_with_questions, question_text.to_s)
            result[field.question_id.to_s] = value if field
          end
        end

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

        def validate_locale
          allowed = project.available_locales.map(&:to_s)
          return if allowed.include?(locale)

          errors.add(:locale, "must be one from available locale: [#{allowed.join(', ')}]")
        end

        def validate_custom_profile_fields
          profile_fields_with_questions = project.profile_setting.profile_fields.includes(:question)

          custom_profile_fields.each do |question_text, value|
            field = find_profile_field_by_question_text(profile_fields_with_questions, question_text.to_s)

            unless field
              errors.add(:custom_profile_fields, "Unknown field: #{question_text}")
              next
            end

            validate_custom_field_value(field.question, question_text.to_s, value)
          end
        end

        def validate_custom_field_value(question, question_text, value)
          validation_errors = Questions::Validation.call!(question, value, I18n.locale)
          return unless validation_errors

          validation_errors.each do |error|
            errors.add(:custom_profile_fields, "#{question_text}: #{error}")
          end
        end

        def find_profile_field_by_question_text(profile_fields, question_text)
          profile_fields.find do |pf|
            ActionController::Base.helpers.strip_tags(pf.question.props['questionText']) == question_text
          end
        end

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
