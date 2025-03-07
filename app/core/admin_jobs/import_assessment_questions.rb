# frozen_string_literal: true

module AdminJobs
  class ImportAssessmentQuestions < AdminJobs::Base
    def call
      form = Assessments::QuestionsImport::ImportForm.new(roo_excel: roo_excel).with_context(assessment: assessment)
      return broadcast :ok, { error_messages: form.errors.full_messages } unless form.valid?

      Assessment.transaction do
        form.processed_rows.each do |row|
          block = find_or_create_block(row['block'])
          question = create_question(block, row)
          add_factor_scoring(question, row)
        end
      end

      broadcast :ok
    end

    def add_factor_scoring(question, row)
      scoring = row['scoring']
      return if scoring.blank?

      scoring.each do |factor_name, comma_separated_scores|
        props = Assessments::QuestionsImport::ScoresColumnToFactorsScoringProps.call!(question, comma_separated_scores)
        FactorsScoring.create!(question_id: question.id, factor_id: factors_index_by_name[factor_name].id, props: props)
      end
    end

    def create_question(block, row)
      attributes = Assessments::QuestionsImport::QuestionForm.new(row['question']).attributes
      attributes['props'] = process_question_props(row)
      attributes['required_validation'] = process_required_validation(row['required_validation'])
      block.questions.create!(attributes)
    end

    def process_question_props(row)
      form_class = Assessments::QuestionsImport::ProcessedRowForm::QUESTION_PROPERTY_FORMS[row.dig('question', 'type')]
      return {} unless form_class

      form_class.new(row['question_property']).attributes
    end

    def process_required_validation(validation_options)
      return { 'enabled' => false, 'type' => 'Force' } if validation_options.nil? || validation_options['type'].nil?

      { 'enabled' => true, type: validation_options['type'] }
    end

    def find_or_create_block(block_details)
      block_name = block_details['name']
      @index_block ||= assessment.blocks.index_by(&:name)
      return @index_block[block_name] if @index_block[block_name]

      @index_block[block_name] = assessment.blocks.create(
        Assessments::QuestionsImport::BlockForm.new(block_details).attributes
      )
    end

    def generate_title_link
      {
        href: "/administration/assessments/#{assessment.id}",
        label: assessment.name
      }
    end

    def valid?
      assessment.present?
    end

    private

    def roo_excel
      Roo::Excelx.new(record.file.url)
    end

    def factors_index_by_name
      @factors_index_by_name ||= assessment.dimension.all_factors.select(:id, :name).index_by(&:name)
    end

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end
  end
end
