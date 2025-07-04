# frozen_string_literal: true

module SkillsRater
  class SyncAssessmentEntities < BaseCommand
    attr_reader :project, :dimension

    def initialize(project_id)
      @project = Project.find(project_id)
    end

    def call
      ActiveRecord::Base.transaction do
        @dimension = find_or_create_skills_rater_dimension
        sync_question_and_factor_for_skills

        broadcast :ok, dimension
      end
    end

    private

    def find_or_create_skills_rater_dimension
      Dimension.find_or_initialize_by(dimension_type: :skills_rater, owner_id: project.id).tap do |dimension|
        dimension.name = "#{project.name} - Skills Rater"
        dimension.save!
      end
    end

    def sync_question_and_factor_for_skills
      project.skills.each do |skill|
        question = Question.find_or_initialize_by(skill_id: skill.id)
        question.assign_attributes(
          name: "#{skill.name} Question",
          type: 'SkillsRater',
          owner_id: project.id
        )
        question.save!

        factor = Factor.find_or_initialize_by(skill_id: skill.id)
        factor.assign_attributes(
          name: skill.name,
          description: skill.description,
          dimension_id: dimension.id
        )
        factor.save!
      end
    end
  end
end
