# frozen_string_literal: true

module Builders
  class AssessmentBuilder
    # Authorisation flow
    include Pundit
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      current_user
    end

    attr_accessor :current_user, :assessment, :assessment_params, :trash

    def initialize(assessment, params, current_user)
      @current_user = current_user
      @assessment = assessment
      @assessment_params = params.require(:assessment).permit!
      @trash = params[:trash].map(&:permit!)
    end

    # rubocop:disable Metrics/BlockLength
    def save
      ActiveRecord::Base.transaction do
        @assessment.update(@assessment_params.slice(:flow, :norm_rules, :enable_back, :enable_progress))
        @assessment_params[:blocks].each do |block_params|
          id = block_params.delete(:id)
          questions = block_params.delete(:questions)
          block = @assessment.blocks.find_or_initialize_by(id: id)
          block.update(block_params)

          questions.each do |question_params|
            id = question_params.delete(:id)
            question = id ? @assessment.questions.find(id) : block.questions.build
            question.update(question_params.merge(block_id: block.id))
          end
        end

        @trash.each do |item|
          case item[:type]
            when 'Question'
              resource = policy_scope(::Question).find(item[:model].delete(:id))
            when 'Block'
              resource = policy_scope(::Block).find(item[:model].delete(:id))
            else
              raise 'Invalid resource type'
          end

          if item[:permanent_remove]
            resource.destroy
          else
            resource.assign_attributes(item[:model])
            resource.deleted_at ||= Time.now
            resource.save
          end
        end
      rescue StandardError => e
        # Rails.logger.info(e)
        Rails.logger.log(e)
        return false
      end
      true
    end
    # rubocop:enable Metrics/BlockLength
  end
end
