module EndUser
  class ReportSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :mindmill, :hogan, :hogan_url, :load_report,
               :has_external_report, :generating, :pdf_url, :mindmill_report_url

    def mindmill
      assign.mindmill?
    end

    def mindmill_report_url
      assign.mindmill_report.url if object.mindmill?
    end

    def hogan
      object.assessment.hogan?
    end

    def load_report
      object.hogan_report_setting&.load_report?
    end

    def has_external_report
      assigns_report&.external_report.present?
    end

    def hogan_url
      results_hogan_assign_path(assign, report_id: object.id)
    end

    def generating
      assigns_report.generating?
    end

    def pdf_url
      assigns_report.pdf.url
    end

    private

    def assessment
      @assessment ||= object.assessment
    end

    def assigns_report
      @assigns_report ||= assign.original_or_self.assigns_reports.find_by(report: object)
    end

    def assign
      @assign ||= instance_options[:assign]
    end
  end
end
