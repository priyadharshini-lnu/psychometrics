# frozen_string_literal: true

module Administration
  class ExternalUserReportSerializer < Panko::Serializer
    attributes :id, :report_name, :user_id, :user_email, :pdf_url, :can_download_report

    def report_name
      object.report.name
    end

    delegate :user_id, to: :object

    def user_email
      object.user.email
    end

    def pdf_url
      object.pdf_download_url
    end

    def can_download_report
      context[:current_user].has_permission?(:results, :download_report, project_id: object.project.id)
    end
  end
end
