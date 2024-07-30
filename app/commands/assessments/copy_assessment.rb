# frozen_string_literal: true

module Assessments
  class CopyAssessment < BaseCommand
    private_attr_reader :assessment, :owner_id, :current_user, :skip_owner_validation, :new_assessment_name,
                        :questions_to_copy

    def initialize(assessment_id, current_user, owner_id = nil, # rubocop:disable Metrics/ParameterLists
                   skip_owner_validation: false, new_assessment_name: nil, questions_to_copy: nil)
      @assessment = Assessment.includes(blocks: {
        questions: %i[factors_scorings question_recodings translations]
      }).find(assessment_id)
      @owner_id = owner_id || @assessment.owner_id
      @current_user = current_user
      @blocks_mapping = {}
      @questions_to_copy = questions_to_copy
      @questions_mapping = {}
      @skip_owner_validation = skip_owner_validation
      @new_assessment_name = new_assessment_name
    end

    def call # rubocop:disable Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      # Get original flow and norm_rules
      flow = (assessment.flow || {}).to_json
      norm_rules = (assessment.norm_rules || {}).to_json

      # rubocop:disable Metrics/BlockLength
      new_assessment = ActiveRecord::Base.transaction do
        new_assessment = assessment.clone
        new_assessment.name = new_assessment_name if new_assessment_name
        new_assessment.owner_id = owner_id
        new_assessment.created_by = current_user
        new_assessment.updated_by = current_user
        new_assessment.skip_owner_validation = skip_owner_validation
        new_assessment.save!

        scoring_question_ids = assessment.factors_scoring.pluck(:question_id)
        no_scoring_questions = assessment.question_ids - scoring_question_ids
        question_ids = questions_to_copy ? questions_to_copy.pluck(:id) : assessment.question_ids

        question_ids |= no_scoring_questions

        # Loop blocks to save for the new assessment
        assessment.blocks.each do |block|
          # Loop questions to save for the new block
          block_question_ids = block.questions.pluck(:id)

          next if (block_question_ids & question_ids).size.zero?

          @new_block = make_copy(block, new_assessment)
          @new_block.save!

          @blocks_mapping[block.id] = @new_block.id

          # Replace original Block Id to New Block Id
          flow = update_id_in_json_config(flow, block.id, @blocks_mapping, 'current')

          block.questions.where(id: block_question_ids & question_ids).each do |question|
            new_question = make_copy(question, new_assessment)
            new_question.save!
            @questions_mapping[question.id] = new_question.id
            %w[factors_scorings question_recodings].map do |name|
              copy_association(name, question, new_question, new_assessment)
            end

            question_config = @questions_to_copy&.find { |qc| qc[:id] == question.id }
            if question_config && new_question.type == 'MatrixTable'
              update_matrix_question(new_question, question_config)
            end

            new_question.save!
            @new_block.questions << new_question

            copy_translations(question, new_question, new_assessment)
          end
        end
        # rubocop:enable Metrics/BlockLength

        # We can't combine this in the same iteration since the the question that the
        # display_logic and skip_logic pointing to couldn't have been copied yet.
        update_json_configurations!(new_assessment)

        # Replace original Question Id to New Question Id
        # flow, norm_rules = update_flow_and_norm_rules(new_assessment, flow, norm_rules)
        new_assessment.questions.each do |question|
          flow = update_id_in_json_config(flow, question.id, @questions_mapping)
          norm_rules = update_id_in_json_config(norm_rules, question.id, @questions_mapping)
        end
        new_assessment.update(flow: JSON.parse(flow), norm_rules: JSON.parse(norm_rules, quirks_mode: true))

        new_assessment
      end
      broadcast :ok, { assessment: new_assessment, questions_mapping: @questions_mapping }
    rescue ActiveRecord::RecordInvalid
      broadcast(:error)
    end

    private

    def update_matrix_question(new_question, question_config)
      choice_texts = question_config[:selected_choice_indexes].map { |index| new_question.props['choicesTexts'][index] }
      new_question.props['choicesTexts'] = choice_texts
      new_question.props['choices'] = choice_texts.size

      new_question.factors_scorings.each do |fs|
        scores = question_config[:selected_choice_indexes].map.with_index do |index, new_index|
          score = fs.props.find { |s| s['index'] == index }
          next unless score

          score['index'] = new_index
          score
        end

        fs.update(props: scores)
      end
    end

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

          question_ids = json.scan(/"subject":"?(\d+)"?/).flatten
          question_ids.each { |question_id| json = update_id_in_json_config(json, question_id, @questions_mapping) }

          if column == 'skip_logic'
            block_ids = json.scan(/"destinationBlock":"?(\d+)"?/).flatten
            block_ids.each do |id|
              json = update_id_in_json_config(json, id, @blocks_mapping, 'destinationBlock')
            end
          end
          question.update_attribute(column, JSON.parse(json))
        end
      end
    end

    def update_id_in_json_config(json, value, mapping, key = 'subject')
      return json unless mapping[value.to_i]

      json.gsub(/"#{key}":"?#{value}"?/, "\"#{key}\":#{mapping[value.to_i]}")
    end
  end
end
