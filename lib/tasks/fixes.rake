# frozen_string_literal: true

namespace :fixes do
  desc 'count factors in dimensions'
  task count_factors: :environment do
    Dimension.all.each do |dimension|
      dimension.update(factors_count: dimension.factors.count)
    end
  end

  desc 'fix display logic format'
  task display_logic_format: :environment do
    Question.where.not(display_logic: nil).each do |question|
      next unless question.display_logic&.is_a?(Array)

      conditions = question.display_logic.map do |condition|
        condition.dup.tap do |cond|
          cond['prefix'] = 'And'
        end
      end
      question.display_logic = {
        conditions: [{ prefix: 'And', conditions: conditions }]
      }

      question.save
    end
  end
end
