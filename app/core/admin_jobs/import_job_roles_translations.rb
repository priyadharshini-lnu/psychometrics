# frozen_string_literal: true

module AdminJobs
  class ImportJobRolesTranslations < AdminJobs::Base
    def call
      project_id = record.data['project_id']

      result = Administration::ImportJobRoleTranslations.new(
        record.file,
        project_id
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end
  end
end
