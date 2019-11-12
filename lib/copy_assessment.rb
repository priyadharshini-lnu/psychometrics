# frozen_string_literal: true

# Clone Assessment with flow and norm_rules in the same structure
# alone with blocks, questions, question_recodings, factor_scorings
# and translations
class CopyAssessment
  # rubocop:disable Metrics/AbcSize
  def self.process!(assessment_id)
    assessment = Assessment.includes(blocks: {
      questions: %i[factors_scorings question_recodings translations]
    }).find(assessment_id)

    # Get original flow and norm_rules
    flow = (assessment.flow || {}).to_json
    norm_rules = (assessment.norm_rules || {}).to_json

    # rubocop:disable Metrics/BlockLength
    new_assessment = Assessment.transaction do
      new_assessment = assessment.clone
      new_assessment.save
      # Loop blocks to save for the new assessment
      assessment.blocks.each do |block|
        new_block = block.clone(false)
        new_assessment.blocks << new_block

        # Replace original Block Id to New Block Id
        flow.gsub!(/\"current\":\"#{block.id}\"/, "\"current\":\"#{new_block.id}\"")

        # Loop questions to save for the new block
        block.questions.each do |question|
          new_question = question.clone(false)
          new_question.assessment_id = new_assessment.id
          new_block.questions << new_question

          # Replace original Question Id to New Question Id
          flow.gsub!(/\"subject\":#{question.id}/, "\"subject\":#{new_question.id}")
          norm_rules.gsub!(/\"subject\":#{question.id}/, "\"subject\":#{new_question.id}")

          question.factors_scorings.each do |factors_scoring|
            new_factors_scoring = factors_scoring.clone(false)
            new_factors_scoring.assessment_id = new_assessment.id
            new_question.factors_scorings << new_factors_scoring
          end

          question.question_recodings.each do |recoding|
            new_recoding = recoding.clone(false)
            new_recoding.assessment_id = new_assessment_id
            new_question.question_recodings << new_recoding
          end

          question.translations.each do |translation|
            new_translation = translation.clone(false)
            new_translation.translateable_id = new_question.id
            new_translation.resource_id = new_assessment.id
            new_question.translations << new_translation
          end
        end
      end
      new_assessment.update_attributes(flow: JSON.parse(flow), norm_rules: JSON.parse(norm_rules, quirks_mode: true))
      new_assessment
    end
    # rubocop:enable Metrics/BlockLength
    new_assessment
  end
  # rubocop:enable Metrics/AbcSize
end
