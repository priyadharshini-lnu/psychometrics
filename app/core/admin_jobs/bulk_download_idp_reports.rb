# frozen_string_literal: true

module AdminJobs
  class BulkDownloadIdpReports < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    step :generate, AdminJobSteps::BulkDownloadIdpReports::GenerateJob, weight: 0.7
    step :download, AdminJobSteps::BulkDownloadIdpReports::DownloadJob, weight: 0.3

    def valid?
      campaign.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants",
        label: "#{campaign.name} - IDP Reports[#{record.data['lang']}]#{record.data['include_reflective_questions'] ? ' With Reflective Questions' : ''}" # rubocop:disable Layout/LineLength
      }
    end

    def generate_details
      []
    end

    def self.validate(data, owner)
      if AdminJobRecord.where('data::jsonb @> ?::jsonb', data.to_json).exists?(owner: owner,
                                                                               parent_job_id: nil,
                                                                               status: %i[scheduled in_progress])
        raise AdminJob::AlreadyExistsError
      end
    end

    private

    def user_idp_plans
      @user_idp_plans ||= campaign.user_idp_plans
    end
  end
end
