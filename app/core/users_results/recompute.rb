# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :current_user, :norm_id

    def initialize(user_result, current_user, options = {})
      @user_result = user_result
      @current_user = current_user
      @norm_id = options[:norm_id]
    end

    def call
      user_result.norm_id = norm_id if norm_id

      if user_result.assessment.agile?
        compute_agile_assessment_scoring
      else
        compute_common_assessment_scoring
      end

      ::UsersResults::GenerateReports.call!(user_result, current_user)

      broadcast :ok, user_result
    end

    private

    def compute_common_assessment_scoring
      user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result, norm_data)
      user_result.occupations = Assigns::CalculateOccupations.call!(user_result)
      user_result.innovation_styles = Assigns::CalculateInnovationStyles.call!(user_result)
      user_result.save!
    end

    def compute_agile_assessment_scoring
      ::UsersResults::CalculateAgileScoring.call!(user_result, current_user)
    end

    def norm_data
      {
        'id' => norm_id || user_result.norm_id
      }
    end
  end
end
