# frozen_string_literal: true

module EndUser
  class UserReportSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :report_name, :status, :user_access, :user_id, :pdf_url, :require_approval, :poster_url, :pdf_urls

    def poster_url
      object.report.poster_url
    end

    def approved
      object.approved?
    end

    def pdf_url
      return nil if require_approval && !object.approved?

      object.pdf_download_url
    end

    def pdf_urls
      return nil if require_approval && !object.approved?

      expected_locales = [
        object.effective_default_language, object.campaign_report&.available_languages
      ].flatten.compact.uniq
      return {} if expected_locales.blank?

      expected_locales.index_with do |locale|
        object.pdf_download_url(locale: locale)
      end.compact
    end

    def report_name
      object.report.name
    end

    def require_approval
      object.has_approval_workflow?
    end
  end
end
