# frozen_string_literal: true

module AdminJobs
  class ExportProficiencyLevelsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.proficiency_levels.export.details'), file_link]]
    end

    def generate_title_link
      {
        href: project ? project_export_path : general_export_path,
        label: project&.name || 'Proficiency Levels Export'
      }
    end

    def headers
      %w[ID Project ProficiencyType SkillCategory SkillName TotalLevels LevelNumber LevelName LevelDescription]
    end

    def records_for_export
      rows = []
      ProficiencyLevel.where(project_id: project&.id).includes(:skill).find_each do |pl|
        # Sort level_definition array by level number before creating rows
        sorted_levels = pl.level_definition.sort_by { |def_item| def_item['level'].to_i }
        sorted_levels.each do |level_def|
          rows << {
            proficiency_level: pl,
            level_def: level_def
          }
        end
      end
      rows
    end

    def data_row(record)
      pl = record[:proficiency_level]
      level_def = record[:level_def]
      [
        pl.id,
        pl.project_id,
        pl.proficiency_type,
        pl.skill_category,
        pl.skill&.name,
        pl.level,
        level_def['level'],
        level_def['name'],
        level_def['description']
      ]
    end

    def file_name
      project&.name ? "#{project.name}-proficiency_levels.csv" : 'proficiency_levels.csv'
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end

    def project_export_path
      "/admin/projects/#{project.id}/proficiency_levels/export"
    end

    def general_export_path
      '/admin/proficiency_levels/export'
    end
  end
end
