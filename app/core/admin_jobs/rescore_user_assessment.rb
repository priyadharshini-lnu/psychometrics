# frozen_string_literal: true

module AdminJobs
  class RescoreUserAssessment < AdminJobs::Base
    def call
      ::UsersResults::Recompute.call!(user_result, owner)
      broadcast :ok
    end

    private

    def user_result
      UsersResult.find(record.data['user_result_id'])
    end
  end
end
