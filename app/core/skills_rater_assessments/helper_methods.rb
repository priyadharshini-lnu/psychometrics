# frozen_string_literal: true

module SkillsRaterAssessments
  module HelperMethods
    delegate :sheet, to: :roo_excel

    def roo_excel
      @roo_excel ||= Roo::Excelx.new(file_path)
    end

    def get_group_levels(sheet_name)
      sheet = sheet(sheet_name)
      levels = {}

      (2..sheet.last_row).each do |i|
        row = sheet.row(i)
        levels[row[0]] = row[1] # e.g. "Job Group 1" => "Job Family"
      end

      levels
    end

    def number_of_group_levels(sheet_name)
      get_group_levels(sheet_name).size
    end

    # Job Group
    def find_or_create_job_group(name, parent = nil)
      job_group = JobGroup.find_or_initialize_by(name: name, project_id: project&.id)
      job_group.parent = parent if parent
      job_group.save!
      job_group
    end

    # Job Role
    def find_or_create_job_role(name, code, description, job_group)
      job_role = JobRole.find_or_initialize_by(name: name, project_id: project&.id)
      job_role.code = code
      job_role.description = description
      job_role.job_group = job_group
      job_role.save!
      job_role
    end

    # Skill Group
    def find_or_create_skill_group(name, parent = nil)
      skill_group = SkillGroup.find_or_initialize_by(name: name, project_id: project&.id)
      skill_group.parent = parent if parent
      skill_group.save!
      skill_group
    end

    # Skill
    def find_or_create_skill(name, definition, skill_type, skill_group)
      skill = Skill.find_or_initialize_by(name: name, project_id: project&.id)
      skill.description = definition
      skill.skill_type = skill_type.downcase
      skill.skill_group = skill_group
      skill.save!
      skill
    end

    # Mapping
    def create_job_role_skill_mapping(job_role, skill, proficiency_level)
      mapping = SkillsJobRole.find_or_initialize_by(
        job_role_id: job_role.id,
        skill_id: skill.id
      )
      mapping.expected_proficiency_level = proficiency_level
      mapping.save!
      mapping
    end
  end
end
