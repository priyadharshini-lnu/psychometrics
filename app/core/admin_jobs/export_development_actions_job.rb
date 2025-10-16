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
        DevelopmentActionType
        AvailableLanguages
        CourseURL
        CourseStartDate
        CourseEndDate
        CourseImage
        Duration
      ]
    end

    def records_for_export
      project_id = record.data['project_id']
      scope = if project_id.present?
                DevelopmentAction.where(owner_type: 'Client', owner_id: project_id)
              else
                DevelopmentAction.where(owner_id: nil)
              end
      scope.includes(:skills)
    end

    def data_row(development_action)
      [
        [
          development_action.id,
          development_action.skills.pluck(:id).join(', '),
          development_action.name,
          development_action.description,
          development_action.learning_style,
          development_action.project_id,
          development_action.development_action_type,
          development_action.available_languages.join(', '),
          development_action.course_url,
          development_action.course_start_date&.strftime('%Y-%m-%d'),
          development_action.course_end_date&.strftime('%Y-%m-%d'),
          development_action.image_url,
          development_action.duration
        ]
      ]
    end

    def file_name
      project&.name ? "#{project.name}-development-actions.csv" : 'development-actions.csv'
    end
  end
end
