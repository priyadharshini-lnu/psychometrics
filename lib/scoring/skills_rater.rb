# frozen_string_literal: true

module Scoring
  class SkillsRater
    def calculate(_question, skill, result)
      return empty_response unless valid_answer?(result)

      selected_level = result['answers'].first['level'].to_i
      proficiency_levels = proficiency_level(skill).level_definition
      max_level = proficiency_levels.max_by { |l| l['level'] }['level']

      {
        value: selected_level,
        value_sum: selected_level,
        max_value: max_level
      }
    end

    private

    def proficiency_level(skill)
      result = Skills::GetProficiencyLevel.call(skill)
      result.dig(:ok, :proficiency_level)
    end

    def valid_answer?(result)
      result &&
        result['answers']&.first &&
        result['answers'].first['level'].present? &&
        result['not_applicable'] != true
    end

    def empty_response
      {
        value: nil,
        value_sum: nil,
        max_value: nil,
        proficiency_level: nil
      }
    end
  end
end
