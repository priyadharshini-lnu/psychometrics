# frozen_string_literal: true

module UsersResults
  class RecomputeJob < ApplicationJob
    queue_as :low_priority

    def perform(users_result, user)
      ::UsersResults::Recompute.call!(users_result, user)
    end
  end
end
