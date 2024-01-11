# frozen_string_literal: true

module AdminJobs
  class ExternalAssessmentExport < BaseExportXlsx
    def valid?
      campaign.present? && assessment.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{assessment.name}"
      }
    end

    def generate_details
      [[I18n.t('common.model.assessment'), file_link || assessment.name]]
    end

    private

    def xlsx
      if assessment.mindmill?
        ::Assessments::Export::Mindmill.call!(assessment, campaign)
      elsif assessment.hogan?
        ::Assessments::Export::Hogan.call!(assessment, campaign)
      elsif assessment.saville?
        ::Assessments::Export::Saville.call!(assessment, campaign)
      elsif assessment.iiht?
        ::Assessments::Export::Iiht.call!(assessment, campaign)
      elsif assessment.pearson?
        ::Assessments::Export::Pearson.call!(assessment, campaign)
      end
    end

    def file_name
      "assessment-#{assessment.id}-external-results.xlsx"
    end

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end
  end
end
