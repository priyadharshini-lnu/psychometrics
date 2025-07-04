# frozen_string_literal: true

module SkillsRaterAssessments
  class ImportTaxonomies < BaseCommand
    include HelperMethods

    attr_reader :file_path, :project

    FIRST_DATA_ROW = 2

    def initialize(file_path:, project:)
      @file_path = file_path
      @project = project
    end

    def call
      ActiveRecord::Base.transaction do
        import_taxonomy_levels
        import_job_group_and_job_roles
        import_skill_group_and_skills
        import_job_role_skills
      end
    end

    private

    def import_taxonomy_levels
      %w[job_group skill_group].each do |type|
        get_group_levels("#{type.titleize} Levels").each_with_index do |(_, label), index|
          level = TaxonomyLevel.find_or_initialize_by(
            project_id: project&.id,
            hierarchy_type: type,
            depth: index
          )
          level.label = label
          level.save!
        end
      end
    end

    def import_job_group_and_job_roles
      level_count = number_of_group_levels('Job Group Levels')
      sheet = sheet('Job Roles')

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        current_parent = nil
        job_group = nil

        level_count.times do |level|
          code_index = level * 2
          name_index = code_index + 1

          # code = row[code_index]
          name = row[name_index]
          job_group = find_or_create_job_group(name, current_parent)

          # This group becomes parent for next level
          current_parent = job_group
        end

        # After processing all job group levels, create job role
        job_title_code = row[level_count * 2]
        job_description = row[(level_count * 2) + 1]
        job_title_name = row[(level_count * 2) + 2]

        find_or_create_job_role(job_title_name, job_title_code, job_description, job_group)
      end
    end

    def import_skill_group_and_skills
      level_count = number_of_group_levels('Skill Group Levels')
      sheet = sheet('Skills')

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        current_parent = nil
        skill_group = nil

        level_count.times do |level|
          code_index = level * 2
          name_index = code_index + 1
          name = row[name_index]

          skill_group = find_or_create_skill_group(name, current_parent)
          current_parent = skill_group
        end

        # Skill data starts after all group levels
        start_index = level_count * 2
        # skill_code = row[start_index]
        skill_name = row[start_index + 1]
        skill_definition = row[start_index + 2]
        skill_type = row[start_index + 3]

        find_or_create_skill(
          skill_name,
          skill_definition,
          skill_type,
          skill_group
        )
      end
    end

    def import_job_role_skills
      sheet = sheet('Job Roles And Skills Mapping')

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        job_role_code = row[0]
        skill_name = row[1]
        proficiency_level = row[2]

        job_role = JobRole.find_by(code: job_role_code, project_id: project&.id)
        skill = Skill.find_by(name: skill_name, project_id: project&.id)
        next unless job_role && skill
        next if proficiency_level.blank?

        create_job_role_skill_mapping(job_role, skill, proficiency_level)
      end
    end
  end
end
