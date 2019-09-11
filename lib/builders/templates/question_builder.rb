# frozen_string_literal: true

module Builders
  module Templates
    class QuestionBuilder
      attr_accessor :question, :params

      def initialize(question, params)
        @question = question
        @params = params.permit!
      end

      def save
        ActiveRecord::Base.transaction do
          _id = params.delete(:id)
          @question.update(params)
        rescue StandardError => e
          Rails.logger.info(e)
          return false
        end
        true
      end
    end
  end
end
