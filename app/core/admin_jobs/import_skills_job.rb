# frozen_string_literal: true

module AdminJobs
  class ImportSkillsJob < AdminJobs::Base
    def call
      result = Administration::ImportSkills.new(
        record.file.url,
        record.data['project_id']
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end
  end
end
