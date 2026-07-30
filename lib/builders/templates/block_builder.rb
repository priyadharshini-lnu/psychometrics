# frozen_string_literal: true

module Builders
  module Templates
    class BlockBuilder
      attr_accessor :block, :params

      def initialize(block, params)
        @block = block
        @params = params
      end

      def save
        ActiveRecord::Base.transaction do
          _id = params.delete(:id)
          questions = params.delete(:questions) || []
          @block.update!(params)

          questions.each do |question_params|
            question_id = question_params.delete(:id)

            if question_id.nil?
              # New question
              question_params[:block_id] ||= @block.id
              question_params.delete(:deleted_at)
              question = @block.questions.build(question_params)
              question.owner_id ||= @block.owner_id
              question.view = :blocks
              question.skip_owner_validation = true
              question.save!
            else
              # Existing question (including soft-deleted)
              question = @block.questions.find_or_initialize_by(id: question_id)
              question.update!(question_params)
            end
          end
          true
        rescue ActiveRecord::RecordInvalid => e
          @errors = { error: e.record.errors.full_messages }
          false
        end
      end
    end
  end
end
