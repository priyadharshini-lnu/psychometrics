# frozen_string_literal: true

module Assessments
  class CopyAssessment < Rectify::Command
    def initialize(assessment_id)
      @assessment = Assessment.includes(blocks: {
        questions: %i[factors_scorings question_recodings translations]
      }).find(assessment_id)

      @blocks_mapping = {}
      @questions_mapping = {}
    end

    def call
      # Get original flow and norm_rules
      flow = (assessment.flow || {}).to_json
      norm_rules = (assessment.norm_rules || {}).to_json

      new_assessment = ActiveRecord::Base.transaction do
        new_assessment = assessment.clone
        new_assessment.save!

        # Loop blocks to save for the new assessment
        assessment.blocks.each do |block|
          new_block = make_copy(block, new_assessment)
          new_block.save!

          @blocks_mapping[block.id] = new_block.id

          # Replace original Block Id to New Block Id
          flow = update_id_in_json_config(flow, block.id, @blocks_mapping, 'current')

          # Loop questions to save for the new block
          block.questions.each do |question|
            new_question = make_copy(question, new_assessment)
            new_block.questions << new_question

            @questions_mapping[question.id] = new_question.id

            %w[factors_scorings question_recodings].map do |name|
              copy_association(name, question, new_question, new_assessment)
            end

            copy_translations(question, new_question, new_assessment)
          end
        end

        # We can't combine this in the same iteration since the the question that the
        # display_logic and skip_logic pointing to couldn't have been copied yet.
        update_json_configurations!(new_assessment)

        # Replace original Question Id to New Question Id
        # flow, norm_rules = update_flow_and_norm_rules(new_assessment, flow, norm_rules)
        new_assessment.questions.each do |question|
          flow = update_id_in_json_config(flow, question.id, @questions_mapping)
          norm_rules = update_id_in_json_config(norm_rules, question.id, @questions_mapping)
        end
        new_assessment.update_attributes(flow: JSON.parse(flow), norm_rules: JSON.parse(norm_rules, quirks_mode: true))

        new_assessment
      end
      broadcast :ok, new_assessment
    rescue ActiveRecord::RecordInvalid
      broadcast(:error)
    end

    private

    attr_reader :assessment

    def make_copy(object, resource, resource_key = 'assessment_id')
      copy = object.clone(false)
      copy[resource_key] = resource.id
      copy
    end

    def copy_association(name, old_question, new_question, assessment)
      old_question.send(name).each do |item|
        new_item = make_copy(item, assessment)
        new_item.question_id = new_question.id

        new_item.save!
      end
    end

    def copy_translations(old_question, new_question, assessment)
      old_question.translations.each do |translation|
        new_translation = make_copy(translation, assessment, 'resource_id')
        new_translation.translateable_id = new_question.id
        new_question.translations << new_translation
      end
    end

    def update_json_configurations!(assessment)
      assessment.questions.each do |question|
        %w[display_logic skip_logic].each do |column|
          json = question[column].to_json

          next if json.blank? || json.starts_with?('null')

          question_ids = json.scan(/\"subject\":\"?(\d+)\"?/).flatten
          question_ids.each { |question_id| json = update_id_in_json_config(json, question_id, @questions_mapping) }

          if column == 'skip_logic'
            block_ids = json.scan(/\"destinationBlock\":\"?(\d+)\"?/).flatten
            block_ids.each do |id|
              json = update_id_in_json_config(json, id, @blocks_mapping, 'destinationBlock')
            end
          end
          question.update_attribute(column, JSON.parse(json))
        end
      end
    end

    def update_id_in_json_config(json, value, mapping, key = 'subject')
      json.gsub(/\"#{key}\":\"?#{value}\"?/, "\"#{key}\":#{mapping[value.to_i]}")
    end
  end
end
