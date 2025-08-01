# frozen_string_literal: true

module Builders
  module Templates
    class QuestionBuilder
      attr_accessor :question, :params

      def initialize(question, params)
        @question = question
        @params = params
      end

      def save
        ActiveRecord::Base.transaction do
          _id = params.delete(:id)
          @question.update!(params)
        # TODO: remove StandardError??
        rescue ActiveRecord::RecordInvalid, StandardError => e
          Rails.logger.info(e)

          false
        end
      end
    end
  end
end
