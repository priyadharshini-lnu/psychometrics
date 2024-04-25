# frozen_string_literal: true

module EndUser
  class UserReportSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :report_name, :status, :user_access, :user_id, :pdf_url, :require_approval, :poster_url

    def poster_url
      object.report.poster&.url
    end

    def approved
      object.approved?
    end

    def pdf_url
      return nil if require_approval && !object.approved?

      object.pdf&.url
    end

    def report_name
      object.report.name
    end

    def require_approval
      object.has_approval_workflow?
    end
  end
end
