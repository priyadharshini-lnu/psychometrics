# frozen_string_literal: true

module EndUser
  class ReportSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :mindmill, :hogan, :results_hogan_url, :hogan_report_setting,
               :has_external_report, :generating, :pdf_url, :mindmill_report_url

    attribute :external_report_url, if: -> { !!assigns_report&.external_report }

    def mindmill
      object.mindmill?
    end

    def mindmill_report_url
      assign.mindmill_report.url if object.mindmill?
    end

    def hogan
      object.assessment.hogan?
    end

    def hogan_report_setting
      object.hogan_report_setting
    end

    def has_external_report # rubocop:disable Naming/PredicateName
      !!assigns_report&.external_report
    end

    def external_report_url
      assigns_report.external_report.url
    end

    def results_hogan_url
      results_hogan_assign_path(assign, report_id: object.id)
    end

    def generating
      # assigns_report.generating?
      [true, false].sample
    end

    def pdf_url
      report_path(object)
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
