# frozen_string_literal: true

module AdminJobs
  class ImportData < AdminJobs::Base
    def call
      import = ::Imports::Assessments::ResultImportUserResult.new(record.data.merge('file' => record.file))
      import.importer = owner
      import.campaign = campaign
      import.assessment = assessment

      if import.process!
        broadcast :ok
      else
        broadcast :ok, error_messages: import.errors.full_messages
      end
    end

    def generate_title_link
      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{assessment.name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.assessments.assessment'), assessment.name]
      ]
    end

    private

    def assessment
      @assessment ||= Assessment.find(record.data['assessment_id'])
    end
  end
end
