# frozen_string_literal: true

module EndUser
  class UserReportSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :report_name, :status, :user_access, :user_id, :pdf_url, :require_approval, :approved

    def pdf_url
      return nil if require_approval && !object.approved

      object.pdf.url
    end

    def report_name
      object.report.name
    end

    def require_approval
      object.report.require_approval?
    end
  end
end
