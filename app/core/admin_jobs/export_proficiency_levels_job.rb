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
      base_headers = %w[ID Project ProficiencyType SkillCategory SkillName TotalLevels]
      max_levels = ProficiencyLevel.where(project_id: project&.id).maximum(:level) || 0
      level_headers = if max_levels.positive?
                        Array.new(max_levels) do |i|
                          ["Level#{i + 1}", "Name#{i + 1}", "Description#{i + 1}"]
                        end.flatten
                      else
                        []
                      end
      base_headers + level_headers
    end

    def records_for_export
      ProficiencyLevel.where(project_id: project&.id).includes(:skill)
    end

    def data_row(record)
      base_data = [
        record.id,
        record.project_id,
        record.proficiency_type,
        record.skill_category,
        record.skill&.name,
        record.level
      ]

      record.level_definition.each do |level_def|
        level_num = level_def['level'].to_i
        next unless level_num <= record.level

        base_data.push(level_def['level'], level_def['name'], level_def['description'])
      end

      base_data
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
