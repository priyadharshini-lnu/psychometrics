# frozen_string_literal: true

module AdminJobs
  class ImportJobRolesTranslations < AdminJobs::Base
    def call
      project_id = record.data['project_id']

      ::JobRoles::ImportTranslations.call!(record.file_url, project_id)

      broadcast :ok
    end

    def valid?
      project.present?
    end
  end
end
