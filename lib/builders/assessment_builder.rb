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

    attr_accessor :current_user, :assessment, :assessment_params, :trash, :selected_locale, :errors

    def initialize(assessment, params, current_user)
      @current_user = current_user
      @assessment = assessment
      @assessment_params = params.require(:assessment).permit!
      @trash = params[:trash].map(&:permit!)
      @selected_locale = params['locale']
    end

    def save
      ActiveRecord::Base.transaction do
        if default_language?
          save_assessment_details
        else
          save_assessment_translations
        end
      end
    rescue StandardError => e
      handle_errors(e)
      false
    end

    private

    def save_assessment_details
      @assessment.update!(@assessment_params.slice(
                            :flow, :norm_rules, :enable_back, :enable_progress, :extra,
                            :data_sheet_columns, :instructions, :options, :default_norm_id,
                            :linked_questions, :campaign_factors_list
                          ))

      form = Administration::Assessments::AllBlocksForm.new(
        blocks: @assessment_params[:blocks]
      )

      unless form.valid?
        raise ActiveModel::ValidationError, form
      end

      @assessment_params[:blocks].each do |block_params|
        id = block_params.delete(:id)
        questions = block_params.delete(:questions)
        block = @assessment.blocks.find_or_initialize_by(id: id)
        block.update!(block_params.merge(deleted_at: block_params[:deleted_at]))

        questions.each do |question_params|
          id = question_params.delete(:id)
          question = id ? @assessment.questions.find(id) : block.questions.build
          question.update!(question_params.merge(block_id: block.id))
        end
      end

      process_trash
    end

    def process_trash
      @trash.each do |item|
        resource = find_resource(item)
        if item[:permanent_remove]
          resource.destroy
        else
          resource.assign_attributes(item[:model])
          resource.deleted_at ||= Time.zone.now
          resource.save
        end
      end
    end

    def find_resource(item)
      case item[:type]
        when 'Question'
          policy_scope(::Question).find(item[:model].delete(:id))
        when 'Block'
          policy_scope(::Block).find(item[:model].delete(:id))
        else
          raise 'Invalid resource type'
      end
    end

    def save_assessment_translations
      Builders::AssessmentTranslationBuilder.new(assessment, assessment_params, selected_locale).save
    end

    def default_language?
      selected_locale == @assessment.default_language
    end

    def handle_errors(e)
      @errors = case e
                  when ActiveModel::ValidationError
                    e.model.errors.full_messages
                  when ActiveRecord::RecordInvalid
                    e.record.errors.full_messages
                  else
                    [e.message]
                end
      Rails.logger.error(e)
    end
  end
end
