# frozen_string_literal: true

module DataReports::FieldHandlers
  class ProjectDetailHandler < ::DataReports::BaseFieldHandler
    ALLOWED_FIELD_NAMES = %w[project_name project_id].freeze

    def call
      return :ok, nil unless ALLOWED_FIELD_NAMES.include?(field['field_name'])

      broadcast :ok, send(field['field_name'])
    end

    private

    def project_name
      cu.project.name
    end

    def project_id
      cu.project.id
    end
  end
end
