# frozen_string_literal: true

module AdminJobs
  class ExportUsers < BaseExportCsv
    def generate_details
      [[I18n.t('frontend.campaign.users.actions.export.details'), file_link]]
    end

    private

    def headers
      UserDecorator.export_headers + profile_fields.map { |f| f.question.name }
    end

    def data_row(user)
      campaign_user = user.campaign_users.find { |cu| cu.campaign_id == campaign.id }
      row = [
        campaign_user.decorate.status_text,
        user.first_name,
        user.last_name,
        user.email,
        user.locale,
        nil,
        nil,
        campaign_user.schedule_start_date,
        campaign_user.schedule_end_date,
        user.decorate.created_at
      ]

      profile_fields.each do |field|
        row << (user.user_profile.custom_fields || {})[field.question_id.to_s]
      end
      row
    end

    def records_for_export
      campaign.users.
        includes(:creator, :modifier, campaign_users: [:campaign], user_assessments: :users_result).
        ransack(record.data['filters']).result
    end

    def profile_fields
      @profile_fields ||= campaign.project.profile_setting.profile_fields.includes(:question)
    end

    def file_name
      'users.csv'
    end
  end
end
