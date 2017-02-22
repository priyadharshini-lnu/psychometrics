module Builders
  module Templates
    class BlockBuilder
      attr_accessor :block, :params

      def initialize(block, params)
        @block = block
        @params = params.permit!
      end

      def save
        ActiveRecord::Base.transaction do
          begin
            _id = params.delete(:id)
            questions = params.delete(:questions)
            @block.update(params)
            questions.each do |question_params|
              question = block.questions.find_or_initialize_by(id: question_params.delete(:id))
              question.update(question_params)
            end
          rescue => e
            Rails.logger.info(e)
            return false
          end
        end
        true
      end
    end
  end
end
