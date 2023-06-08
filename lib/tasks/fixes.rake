# frozen_string_literal: true

namespace :fixes do
  desc 'fix display logic format'
  task display_logic_format: :environment do
    Question.where.not(display_logic: nil).each do |question|
      next unless question.display_logic.is_a?(Array)

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
