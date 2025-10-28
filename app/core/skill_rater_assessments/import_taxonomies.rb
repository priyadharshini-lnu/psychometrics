# frozen_string_literal: true

module SkillRaterAssessments
  class ImportTaxonomies < BaseCommand
    include HelperMethods

    attr_reader :file_path, :project, :imported_skill_ids

    FIRST_DATA_ROW = 2

    def initialize(file_path:, project:)
      @file_path = file_path
      @project = project
      @imported_skill_ids = []
    end

    def call
      ActiveRecord::Base.transaction do
        import_taxonomy_levels
        import_job_group_and_job_roles
        import_skill_group_and_skills
        import_job_role_skills
        import_global_proficiency_levels if project.present?
      end
      broadcast(:ok, imported_skill_ids)
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
      group_levels = get_group_levels('Job Group Levels')
      sheet = sheet('Job Roles')
      job_roles_headers = sheet.row(1)

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        current_parent = nil
        job_group = nil

        group_levels.each_key do |key|
          name = row[find_header_index(job_roles_headers, "#{key} - Name")]
          job_group = find_or_create_job_group(name, current_parent) if name.present?

          # This group becomes parent for next level
          current_parent = job_group if job_group.present?
        end

        # After processing all job group levels, create job role
        job_title_code = row[find_header_index(job_roles_headers, 'Job Title Code')]
        job_description = row[find_header_index(job_roles_headers, 'Job Description')]
        job_title_name = row[find_header_index(job_roles_headers, 'Job Title Name')]

        find_or_create_job_role(job_title_name, job_title_code, job_description, job_group)
      end
    end

    def import_skill_group_and_skills
      group_levels = get_group_levels('Skill Group Levels')
      sheet = sheet('Skills')
      skill_headers = sheet.row(1)

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        current_parent = nil
        skill_group = nil

        group_levels.each_key do |key|
          name = row[find_header_index(skill_headers, "#{key} - Name")]

          skill_group = find_or_create_skill_group(name, current_parent) if name.present?
          current_parent = skill_group
        end

        # Skill data starts after all group levels
        skill_name = row[find_header_index(skill_headers, 'Skill Name')]
        skill_definition = row[find_header_index(skill_headers, 'Skill Definition')]
        skill_type = row[find_header_index(skill_headers, 'Skill Type')]

        skill = find_or_create_skill(
          skill_name,
          skill_definition,
          skill_type,
          skill_group
        )

        imported_skill_ids << skill.id
      end
    end

    def import_job_role_skills
      sheet = sheet('Job Roles And Skills Mapping')
      headers = sheet.row(1)

      (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
        row = sheet.row(row_index)

        job_role_code = row[find_header_index(headers, 'Job Title Code') || 0]
        skill_name = row[find_header_index(headers, 'Skill Name') || 1]
        proficiency_level = row[find_header_index(headers, 'Expected Proficiency Level') || 2]

        job_role = JobRole.find_by(code: job_role_code, project_id: project&.id)
        skill = Skill.find_by(name: skill_name, project_id: project&.id)
        next unless job_role && skill

        create_job_role_skill_mapping(job_role, skill, proficiency_level)
      end
    end

    def import_global_proficiency_levels
      return unless ProficiencyLevel.global.exists?

      import_default_level
      import_type_levels
    end

    def import_default_level
      global_level = ProficiencyLevel.global.default.first
      return unless global_level
      return if ProficiencyLevel.exists?(project_id: project.id, proficiency_type: 'default')

      create_proficiency_level_from_global(global_level)
    end

    def import_type_levels
      ProficiencyLevel.global.by_skill_type.find_each do |global_level|
        next if ProficiencyLevel.exists?(
          project_id: project.id,
          proficiency_type: 'by_skill_type',
          skill_type: global_level.skill_type
        )

        create_proficiency_level_from_global(global_level)
      end
    end
  end
end
