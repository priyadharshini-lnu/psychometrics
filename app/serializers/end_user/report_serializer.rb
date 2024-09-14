# frozen_string_literal: true

module EndUser
  class ReportSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :mindmill, :hogan, :results_hogan_url,
               :has_external_report, :generating, :pdf_url, :mindmill_report_url, :external_report_url

    def mindmill
      object.mindmill?
    end

    def mindmill_report_url
      assign.mindmill_report.url if object.mindmill?
    end

    def hogan
      object.assessment.hogan?
    end

    def has_external_report
      !!assigns_report&.external_report
    end

    def external_report_url
      return unless has_external_report

      assigns_report.external_report.url
    end

    def results_hogan_url
      redirect_hogan_assign_path(assign, report_id: object.id)
    end

    def generating
      assigns_report.generating?
    end

    def pdf_url
      assigns_report.pdf.url
    end

    private

    def assessment
      object.assessment
    end

    def assigns_report
      assign.original_or_self.assigns_reports.find_by(report: object)
    end

    def assign
      context[:assign]
    end
  end
end
