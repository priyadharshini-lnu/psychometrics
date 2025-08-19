# frozen_string_literal: true

module Skills
  class CreateSkillFactorAndQuestion < BaseCommand
    attr_reader :skill, :question, :factor

    def initialize(skill)
      @skill = skill
    end

    def call
      return broadcast :ok unless skill.project_id

      ActiveRecord::Base.transaction do
        dimension = find_or_create_skill_rater_dimension
        create_question
        create_factor(dimension)

        broadcast :ok, { question: question, factor: factor }
      end
    end

    private

    def find_or_create_skill_rater_dimension
      Dimension.skill_rater_dimension(skill.project)
    end

    def create_question
      @question = Question.find_or_initialize_by(skill_id: skill.id)
      @question.assign_attributes(
        name: "#{skill.name} Question",
        type: 'SkillRater',
        owner_id: skill.project_id
      )
      @question.save!
    end

    def create_factor(dimension)
      @factor = Factor.find_or_initialize_by(skill_id: skill.id)
      @factor.assign_attributes(
        name: skill.name,
        description: skill.description,
        dimension_id: dimension.id
      )
      @factor.save!
    end
  end
end
