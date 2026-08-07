# frozen_string_literal: true

module AdminJobs
  class CopyAssessment < AdminJobs::Base
    def call
      result = ::Assessments::CopyAssessment.call(
        record.data['assessment_id'],
        owner,
        record.data['owner_id'],
        skip_owner_validation: record.data.fetch('skip_owner_validation', false),
        new_assessment_name: record.data['name'],
        microsite_settings: record.data['microsite_settings']&.symbolize_keys
      )

      if result[:ok]
        record.update(data: record.data.merge(new_assessment_id: result[:ok][:assessment].id))
        broadcast :ok
      else
        broadcast :error, I18n.t('admin_jobs.copy_assessment.failed')
      end
    end

    def generate_title_link
      assessment = Assessment.find_by(id: record.data['new_assessment_id'])
      return {} unless assessment

      {
        href: "/administration/assessments/#{assessment.id}",
        label: assessment.name
      }
    end

    def valid?
      Assessment.exists?(id: record.data['assessment_id'])
    end
  end
end
