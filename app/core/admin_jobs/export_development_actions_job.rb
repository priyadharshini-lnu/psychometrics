# frozen_string_literal: true

module AdminJobs
  class ExportDevelopmentActionsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.development_actions.export.details'), file_link]]
    end

    def headers
      %w[
        ID
        SkillID
        Name
        Description
        Type
        ProjectID
        Category
        CourseURL
        CourseStartDate
        CourseEndDate
        CourseImage
      ]
    end

    def records_for_export
      DevelopmentAction.where(project_id: record.data['project_id']).
        includes(:skills)
    end

    def data_row(development_action)
      development_action.skills.map do |skill|
        [
          development_action.id,
          skill.id,
          development_action.name,
          development_action.description,
          development_action.learning_style,
          development_action.project_id,
          development_action.category,
          development_action.course_url,
          development_action.course_start_date&.to_s,
          development_action.course_end_date&.to_s,
          development_action.image_url
        ]
      end
    end

    def file_name
      project&.name ? "#{project.name}-development-actions.csv" : 'development-actions.csv'
    end
  end
end
