# frozen_string_literal: true

class UsersResults::RescoreOccupationsJob < ApplicationJob
  queue_as :low_priority

  def perform(users_result_ids, condition_set_id)
    condition_set = OccupationConditionSet.find(condition_set_id)
    results = UsersResult.where(id: users_result_ids)

    results.find_each do |result|
      next unless result.occupation_condition_set_id == condition_set.id

      new_occupations = ::UsersResults::CalculateOccupations.call!(result)

      result.update!(occupations: new_occupations)
    end
  end
end
