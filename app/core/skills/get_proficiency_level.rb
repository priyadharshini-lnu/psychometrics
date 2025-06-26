# frozen_string_literal: true

module Skills
  class GetProficiencyLevel < BaseCommand
    private_attr_reader :skill

    def initialize(skill)
      @skill = skill
    end

    def call
      proficiency_level = find_proficiency_level

      broadcast(:ok, proficiency_level: proficiency_level)
    end

    private

    def find_proficiency_level
      project_proficiency_level || global_proficiency_level
    end

    def project_proficiency_level
      # by_skill
      proficiency_level = ProficiencyLevel.find_by(project_id: skill.project_id, skill_id: skill.id,
                                                   proficiency_type: :by_skill)
      return proficiency_level if proficiency_level.present?

      # by_skill_category
      skill_type = skill.skill_type
      proficiency_level = ProficiencyLevel.find_by(project_id: skill.project_id, skill_category: skill_type,
                                                   proficiency_type: :by_category)
      return proficiency_level if proficiency_level.present?

      # all_skills
      ProficiencyLevel.find_by(project_id: skill.project_id, proficiency_type: :all_skills)
    end

    def global_proficiency_level
      # by_skill
      skill_name = skill.name
      proficiency_level = ProficiencyLevel.joins(:skill).
                          where(skill: { name: skill_name }).find_by(project_id: nil,
                                                                     proficiency_type:
                                                                     :by_skill)
      return proficiency_level if proficiency_level.present?

      # by_skill_category
      skill_type = skill.skill_type
      proficiency_level = ProficiencyLevel.find_by(project_id: nil,
                                                   skill_category:   skill_type,
                                                   proficiency_type: :by_category)
      return proficiency_level if proficiency_level.present?

      # all_skills
      ProficiencyLevel.find_by(project_id: nil, proficiency_type: :all_skills)
    end
  end
end
