# frozen_string_literal: true

module UsersResults
  module Scoring
    class MergeAIScoresJob < ApplicationJob
      queue_as :default

      private attr_reader :users_result, :rescore

      def perform(users_result_id, rescore: false)
        @users_result = UsersResult.find(users_result_id)
        @rescore = rescore

        MergeAIScores.call!(users_result, rescore: rescore)
      end
    end
  end
end
