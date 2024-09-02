# frozen_string_literal: true

module UsersResults
  class Copy < BaseCommand
    private_attr_reader :user_result

    def initialize(user_result)
      @user_result = user_result
    end

    def call
      new_user_result = user_result.deep_clone
      new_user_result.save!
      UsersResults::CopyMediaResponsesJob.set(wait: 30.seconds).perform_later(user_result, new_user_result)
      broadcast :ok, new_user_result
    end
  end
end
