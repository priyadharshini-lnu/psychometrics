# frozen_string_literal: true

module AdminJobs
  class ExportSkillsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.skills.export.details'), file_link]]
    end

    private

    def headers
      %w[ID Name Description SkillType SkillGroup Tag]
    end

    def records_for_export
      Skill.where(project_id: record.data['project_id'])
    end

    def data_row(skill)
      [
        skill.id,
        skill.name,
        skill.description,
        skill.skill_type,
        skill.skill_group&.name,
        skill.all_tags_list.join(', ')
      ]
    end

    def file_name
      project&.name ? "#{project.name}-skills.csv" : 'skills.csv'
    end

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
