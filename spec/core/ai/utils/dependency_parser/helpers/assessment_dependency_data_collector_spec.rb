# frozen_string_literal: true

require 'rails_helper'

describe AI::Utils::DependencyParser::Helpers::AssessmentDependencyDataCollector do
  let(:user) { create(:user) }
  let(:assessment) { create(:assessment) }
  let(:question) { create(:question, assessment: assessment, name: 'Test Question', type: 'MultipleChoice') }
  let(:assessments_config) { [{ 'id' => assessment.id, 'questions' => [question.id] }] }

  subject { described_class.call(assessments_config, user) }

  describe '.call' do
    context 'when user has completed assessment' do
      let!(:user_assessment) do
        create(:user_assessment,
               assessment: assessment,
               subject: user,
               status: :completed)
      end
      let!(:users_result) do
        create(:users_result,
               user_assessment: user_assessment,
               answers: {
                 question.id.to_s => {
                   'answers' => [{ 'index' => 0, 'value' => true }],
                   'question_id' => question.id
                 }
               })
      end

      before do
        user_assessment.update!(users_result: users_result)
        question.update!(props: {
          'questionText' => 'What is your preference?',
          'choicesTexts' => ['Option A', 'Option B']
        })
      end

      it 'successfully collects assessment data' do
        result = subject
        expect(result[:ok]).to be_present
        expect(result[:error]).to be_nil

        collected_data = result[:ok]

        expect(collected_data).to be_an(Array)
        expect(collected_data.length).to eq(1)

        data = collected_data.first
        expect(data[:assessment][:id]).to eq(assessment.id)
        expect(data[:assessment][:name]).to eq(assessment.name)
        expect(data[:questions_data]).to be_an(Array)
        expect(data[:questions_data].first[:id]).to eq(question.id)
        expect(data[:questions_data].first[:question_text]).to eq('What is your preference?')
        expect(data[:questions_data].first[:user_answer]).to eq('Option A')
        expect(data[:users_result][:id]).to eq(users_result.id)
      end
    end

    context 'when no assessments are configured' do
      let(:assessments_config) { [] }

      it 'returns an error' do
        result = subject
        expect(result[:error]).to be_present
        expect(result[:ok]).to be_nil
        expect(result[:error]).to include('No assessments are configured')
      end
    end
  end
end
