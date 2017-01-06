class CopyAssessment

  # Copy assessment with map flow and norm_rules
  # To new block and question ids
  def self.process!(assessment_id)
    assessment = Assessment.includes(blocks: { questions: :factors_scorings }).find(assessment_id)
    # Get original flow and norm_rules
    flow = assessment.flow.to_json
    norm_rules = assessment.norm_rules.to_json

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
        end
      end
      new_assessment.update_attributes(flow: JSON.parse(flow), norm_rules: JSON.parse(norm_rules))
      new_assessment
    end
    new_assessment
  end
end
