# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessments::Export::Questions, type: :service do
  describe '#call' do
    let(:assessment) { create(:assessment) }
    let!(:block1) { create(:block, assessment: assessment, name: 'Block 1') }
    let!(:block2) { create(:block, assessment: assessment, name: 'Block 2') }

    let!(:question1) do
      create(:question,
             block: block1,
             name: 'First Question',
             type: 'MultipleChoice',
             props: {
               'type' => 'multiple_choice',
               'questionText' => 'Choose your favorite color',
               'answersType' => 'single',
               'choicesTexts' => %w[Red Blue Green],
               'notApplicable' => false,
               'notApplicableLabel' => nil,
               'randomization' => {
                 'type' => 'none',
                 'questions' => nil
               }
             },
             required_validation: { 'type' => 'required' },
             assessment_id: assessment.id)
    end

    let!(:question2) do
      create(:question,
             block: block2,
             name: 'Second Question',
             type: 'MatrixTable',
             props: {
               'choices' => 3,
               'scalePoints' => 3,
               'labels' => 0,
               'choicesTexts' => ['Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3'],
               'scalePointsTexts' => ['', '', ''],
               'labelsTexts' => [],
               'questionText' => 'Click to write the question text',
               'type' => 'Likert',
               'answersType' => 'SingleAnswer',
               'textEntrySize' => 'Short',
               'defaultValues' => [],
               'notApplicable' => true,
               'notApplicableLabel' => 'Not Applicable',
               'randomization' => { 'type' => 'No' }
             },
             required_validation: { 'enabled' => false, 'type' => 'Force' },
             assessment_id: assessment.id)
    end

    let!(:factor1) { create(:factor, name: 'Engagement') }
    let!(:factor2) { create(:factor, name: 'Satisfaction') }

    let!(:factor_scoring1) do
      create(:factors_scoring,
             question: question1,
             factor: factor1,
             props: [{ 'value' => '1' }, { 'value' => '2' }])
    end

    let!(:factor_scoring2) do
      create(:factors_scoring,
             question: question2,
             factor: factor2,
             props: [{ 'value' => '3' }])
    end

    let(:package) { described_class.call!(assessment) }
    let(:workbook) { package.workbook }
    let(:sheet) { workbook.worksheets.first }

    it 'generates an Excel package with questions' do
      expect(package).to be_a(ExcelSafe)
      expect(workbook.worksheets.size).to eq(1)
      expect(sheet.name).to eq('Questions')
    end

    describe 'headers' do
      let(:headers) { sheet.rows[0].cells.map(&:value) }
      let(:sub_headers) { sheet.rows[1].cells.map(&:value) }

      it 'generates correct headers' do
        expect(headers).to include(
          'Block', 'Block',
          'Question', 'Question', 'Question',
          'Question Property', 'Question Property', 'Question Property',
          'Question Property', 'Question Property', 'Question Property',
          'Question Property', 'Question Property', 'Question Property',
          'Question Property', 'Question Property',
          'Required Validation',
          'Scoring'
        )
      end

      it 'generates correct sub-headers' do
        expect(sub_headers).to include(
          'Name',
          'ID', 'Name', 'Type',
          'type', 'questionText', 'answersType',
          'choicesTexts', 'choicesTexts', 'choicesTexts',
          'scalePointsTexts', 'scalePointsTexts', 'scalePointsTexts',
          'notApplicable', 'notApplicableLabel',
          'randomization.type', 'randomization.questions',
          'Type',
          'Factors'
        )
      end
    end

    describe 'question row generation' do
      let(:rows) { sheet.rows[2..] }

      it 'generates correct rows for multiple questions' do
        expect(rows.size).to eq(2)

        # First question row
        first_row = rows.first.cells.map(&:value)
        expect(first_row).to include(
          'Block 1',
          question1.id,
          'First Question',
          'MultipleChoice',
          'multiple_choice',
          'Choose your favorite color',
          'single',
          'Red', 'Blue', 'Green',
          nil, nil, nil,
          'false',
          nil,
          'none',
          nil,
          'required',
          'Engagement: 1,2'
        )

        # Second question row
        second_row = rows.last.cells.map(&:value)
        expect(second_row).to include(
          'Block 2',
          question2.id,
          'Second Question',
          'MatrixTable',
          'Likert',
          'Click to write the question text',
          'SingleAnswer',
          nil, nil, nil,
          'Click to write Choice 1', 'Click to write Choice 2', 'Click to write Choice 3',
          'true',
          'Not Applicable',
          'No',
          nil,
          'Force',
          'Satisfaction: 3'
        )
      end
    end
  end
end
