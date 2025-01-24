# frozen_string_literal: true

module AdminJobs
  class ImportSkillsJob < AdminJobs::Base
    def call
      result = Administration::ImportSkills.new(
        record.file.url,
        ignore_duplicates: record.data['ignore_duplicates']
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end
  end
end
