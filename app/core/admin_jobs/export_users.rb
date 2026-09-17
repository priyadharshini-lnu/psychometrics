# frozen_string_literal: true

module AdminJobs
  class ExportUsers < BaseExportCsv
    def generate_details
      [[I18n.t('frontend.campaign.users.actions.export.details'), file_link]]
    end

    private

    def headers
      default_headers  = UserDecorator.export_headers + profile_fields +
                         profile_custom_fields.map { |f| f.question.name }
      default_headers += ['Sign In Link'] if export_sign_in_url?
      default_headers
    end

    def data_row(user)
      campaign_user = user.campaign_users.find { |cu| cu.campaign_id == campaign.id }
      row = [
        campaign_user.decorate.status_text,
        user.is_uat ? 'Yes' : 'No',
        user.first_name,
        user.last_name,
        user.email,
        user.mobile_number,
        nil,
        nil,
        campaign_user.schedule_start_date,
        campaign_user.schedule_end_date,
        user.decorate.created_at,
        user.manager_email,
        campaign_user.current_job_role&.name,
        campaign_user.target_job_role&.name,
        campaign_user.level
      ]

      profile_fields.each do |field|
        row << user.user_profile.send(field)
      end

      profile_custom_fields.each do |field|
        row << (user.user_profile.custom_fields || {})[field.question_id]
      end

      row << user.authenticated_sign_in_url if export_sign_in_url?
      row
    end

    def records_for_export
      User.joins(:campaign_users).
        where(campaign_users: { campaign_id: campaign.id }).
        includes(:creator, :modifier, campaign_users: [:campaign], user_assessments: :users_result).
        ransack(record.data['filters']).result
    end

    def profile_fields
      @profile_fields ||= UserProfile::PROFILE_FIELDS - %i[photo custom_fields]
    end

    def profile_custom_fields
      @profile_custom_fields ||= campaign.project.profile_setting.profile_fields.includes(:question)
    end

    def file_name
      'users.csv'
    end

    def export_sign_in_url?
      record.data['export_sign_in_url'] && Administration::Campaigns::UserPolicy.new(owner, User).export_sign_in_url?
    end
  end
end
