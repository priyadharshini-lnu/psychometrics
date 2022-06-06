# frozen_string_literal: true

module AdminJobs
  class ExportUsers < BaseExportCsv
    def generate_details
      [[I18n.t('frontend.campaign.users.actions.export.details'), file_link]]
    end

    private

    def users
      campaign.users.
        includes(:creator, :modifier, campaign_users: [:campaign], user_assessments: :users_result).
        ransack(record.data['filters']).result
    end

    def locals
      {
        users: users,
        campaign: campaign,
        headers: UserDecorator.export_headers
      }
    end

    def csv_template
      'administration/campaigns/users/index.csv.am'
    end

    def file_name
      'users.csv'
    end
  end
end
