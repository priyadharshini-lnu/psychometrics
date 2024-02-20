# frozen_string_literal: true

module AdminJobs
  class ImportData < AdminJobs::Base
    def call
      import = if assessment.agile?
                 ::Imports::Assessments::ImportAgileUserResult.new(record.data.merge('file' => record.file))
               else
                 ::Imports::Assessments::ResultImportUserResult.new(record.data.merge('file' => record.file))
               end
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
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{assessment.name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.assessments.assessment'), assessment.name]
      ]
    end

    def valid?
      campaign.present? && assessment.present?
    end

    private

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end
  end
end
