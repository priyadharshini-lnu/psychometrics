# frozen_string_literal: true

class UpdateNormRules < ActiveRecord::Migration[5.1]
  def change
    assessments = Assessment.all.select { |a| a.norm_rules.is_a?(Array) }
    assessments.each do |assessment|
      norm_rules = assessment.norm_rules.map do |rule|
        conditions = rule['conditions'].map do |condition|
          condition['prefix'] ? condition : condition.merge('prefix' => 'And')
        end
        rule.merge('conditions' => [{ 'conditions' => conditions, 'prefix' => 'And' }])
      end
      assessment.update(norm_rules: norm_rules)
    end
  end
end
