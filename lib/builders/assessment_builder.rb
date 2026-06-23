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
      Mobility.with_locale(selected_locale || @assessment.default_language || I18n.default_locale) do
        @assessment.update!(@assessment_params.slice(
                              :name, :description, :timing,
                              :flow, :norm_rules, :enable_back, :enable_progress, :extra,
                              :data_sheet_columns, :instructions, :options, :default_norm_id,
                              :linked_questions, :campaign_factors_list
                            ))
      end

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
          update_question!(question, question_params, block.id)
        end
      end

      process_trash
    end

    def update_question!(question, question_params, block_id)
      attributes = question_params.merge(block_id: block_id)
      mark_props_as_changed_if_key_order_updated(question, attributes)
      question.update!(attributes)
    end

    def mark_props_as_changed_if_key_order_updated(question, attributes)
      return unless attributes.key?(:props) || attributes.key?('props')

      new_props = attributes[:props] || attributes['props']
      return if json_with_order(question.props) == json_with_order(new_props)

      question.props_will_change!
    end

    def json_with_order(value)
      normalized_value = value.respond_to?(:to_unsafe_h) ? value.to_unsafe_h : value
      JSON.generate(normalized_value.as_json)
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
