# frozen_string_literal: true

module SkillRaterAssessments
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
      skill.skip_embedding_generation! # Skip individual embedding generation during bulk import
      skill.save!
      skill
    end

    # Mapping
    def create_job_role_skill_mapping(job_role, skill, proficiency_level)
      mapping = SkillsJobRole.find_or_initialize_by(
        job_role_id: job_role.id,
        skill_id: skill.id,
        project_id: project&.id
      )
      mapping.expected_proficiency_level = proficiency_level
      mapping.save!
      mapping
    end

    # Proficiency Level
    def create_proficiency_level_from_global(global_level)
      duplicated_level = global_level.dup
      duplicated_level.project_id = project.id
      duplicated_level.save!
      duplicated_level
    end

    def normalize_header(header)
      header.to_s.downcase.gsub(/(\d)\s*-\s*/, '\1 - ').squish
    end

    def find_header_index(headers, expected_header)
      normalized_expected = normalize_header(expected_header)
      headers.each_with_index do |header, index|
        return index if normalize_header(header) == normalized_expected
      end
      nil
    end
  end
end
