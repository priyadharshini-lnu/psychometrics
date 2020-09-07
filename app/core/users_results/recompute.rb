# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :norm_data, :current_user, :norm_id, :norm_type

    def initialize(user_result, current_user, options = {})
      @user_result = user_result
      @current_user = current_user
      @norm_id = options[:norm_id]
      @norm_type = options[:norm_type]
    end

    def call
      user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result, norm_data)
      user_result.occupations = Assigns::CalculateOccupations.call!(user_result)
      user_result.innovation_styles = Assigns::CalculateInnovationStyles.call!(user_result)
      user_result.norm_id = norm_id if norm_id
      user_result.norm_type = norm_type if norm_type
      user_result.save!

      ::UsersResults::GenerateReports.call!(user_result, current_user)

      broadcast :ok, user_result
    end

    private

    def norm_data
      {
        'id' => norm_id || user_result.norm_id,
        'type' => norm_type || user_result.norm_type
      }
    end
  end
end
