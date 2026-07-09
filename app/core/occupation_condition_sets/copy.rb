# frozen_string_literal: true

module OccupationConditionSets
  class Copy < BaseCommand
    private_attr_reader :source, :new_name

    def initialize(source, new_name)
      @source = source
      @new_name = new_name
    end

    def call
      new_set = create_copy
      broadcast(:ok, new_set)
    rescue ActiveRecord::RecordInvalid => e
      broadcast(:error, e.record.errors)
    end

    private

    def create_copy
      ActiveRecord::Base.transaction do
        new_set = source.dup
        new_set.name = new_name
        new_set.save!

        copy_occupations_factors(new_set)

        new_set
      end
    end

    def copy_occupations_factors(new_set)
      source.occupations_factors.find_each do |factor|
        new_factor = factor.dup
        new_factor.occupation_condition_set_id = new_set.id
        new_factor.save!
      end
    end
  end
end
