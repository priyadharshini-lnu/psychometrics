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

    private

    def campaign
      Campaign.find(record.data['campaign_id'])
    end

    def assessment
      Assessment.find(record.data['assessment_id'])
    end
  end
end
