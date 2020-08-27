# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :norm_data

    def initialize(user_result, norm_data = nil)
      @user_result = user_result
      @norm_data = norm_data || {
        'id' => user_result.norm_id,
        'type' => user_result.norm_type
      }
    end

    def call
      user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result, norm_data)
      user_result.occupations = Assigns::CalculateOccupations.call!(user_result)
      user_result.innovation_styles = Assigns::CalculateInnovationStyles.call!(user_result)
      broadcast :ok, user_result
    end
  end
end
