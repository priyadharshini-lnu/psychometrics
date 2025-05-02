# frozen_string_literal: true

module AdminJobs
  class ExportAssessmentQuestions < AdminJobs::BaseExportXlsx
    def valid?
      assessment.present?
    end

    def generate_title_link
      {
        href: "/administration/assessments/#{assessment.id}",
        label: "#{assessment.name} - questions"
      }
    end

    def generate_details
      [[I18n.t('administration.assessments.export.questions'), file_link]]
    end

    private

    def xlsx
      ::Assessments::Export::Questions.call!(assessment)
    end

    def file_name
      'assessment-questions.xlsx'
    end

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end
  end
end
