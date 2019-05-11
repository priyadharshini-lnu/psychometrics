# frozen_string_literal: true

module UsersResults
  class UpdateUsersResult < Base::BaseCommand
    def initialize(form, users_result, current_user)
      @form = form
      @users_result = users_result
      @current_user = current_user
    end

    def call
      return broadcast(:invalid) if form.invalid?

      transaction do
        update_users_result
        # TODO: Need to implement a different logic for generate report
        # generate_report if users_result.completed?
      end

      broadcast(:ok)
    end

    private

    attr_reader :form, :users_result, :current_user

    # Sets new data to the users_result
    #   and increases the step of users_result
    #
    def update_users_result
      users_result.assign_attributes(form.attributes)
      users_result.step = users_result.step.to_i + 1

      # Calculates scoring and sets time of completion
      if users_result.completed?
        users_result.attributes = ::UsersResults::CalculateScoring.call!(users_result)
        users_result.occupations = ::Assigns::CalculateOccupations.call!(users_result)
        users_result.completed_at = Time.now
      end

      users_result.save!
    end

    # Sends to generate PDF report
    #
    def generate_report; end
  end
end
