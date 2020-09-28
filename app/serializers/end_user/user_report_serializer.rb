# frozen_string_literal: true

module EndUser
  class UserReportSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :pdf, :report_name, :status, :user_access, :user_id, :pdf_url

    def pdf_url
      object.pdf.url
    end

    def report_name
      object.report.name
    end
  end
end
