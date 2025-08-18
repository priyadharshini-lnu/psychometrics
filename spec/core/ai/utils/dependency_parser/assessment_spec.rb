# frozen_string_literal: true

require 'rails_helper'

describe AI::Utils::DependencyParser::Assessment do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant, dependencies: ['assessments']) }
  let(:assessment) { create(:assessment) }
  let(:question) { create(:question, assessment: assessment, name: 'Test Question', type: 'MultipleChoice') }

  subject { described_class.new(campaign_assistant_artifact, user) }

  describe '#parse' do
    context 'when no assessments are configured' do
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: []) # No questions added
      end

      it 'raises a configuration error' do
        expect { subject.parse }.to raise_error(StandardError) do |error|
          expect(error.message).to include(
            I18n.t('administration.ai_assistants.artifacts.parsers.assessment.no_assessments_configured_for_artifact')
          )
        end
      end
    end

    context 'with valid configuration and completed assessment' do
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: [question.id])
      end
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
          'questionText' => 'What is your favorite color?',
          'choicesTexts' => %w[Red Blue Green]
        })
      end

      it 'successfully parses assessment data' do
        result = subject.parse

        expect(result).to include('<assessments>')
        expect(result).to include('<assessment>')
        expect(result).to include("<id>#{assessment.id}</id>")
        expect(result).to include("<name>#{assessment.name}</name>")
        expect(result).to include('<questions>')
        expect(result).to include("<id>#{question.id}</id>")
        expect(result).to include('<text>What is your favorite color?</text>')
        expect(result).to include('<options>')
        expect(result).to include('<option index="0">Red</option>')
        expect(result).to include('<option index="1">Blue</option>')
        expect(result).to include('<option index="2">Green</option>')
        expect(result).to include('</options>')
        expect(result).to include('<user_answer>Red</user_answer>')
        expect(result).to include('</questions>')
        expect(result).to include('</assessment>')
        expect(result).to include('</assessments>')
      end
    end

    context 'when assessment has no completed results' do
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: [question.id])
      end

      it 'raises an error about missing results' do
        expect { subject.parse }.to raise_error(StandardError) do |error|
          expect(error.message).to include(
            I18n.t(
              'administration.ai_assistants.artifacts.parsers.assessment.no_completed_results',
              assessment_name: assessment.name
            )
          )
        end
      end
    end

    context 'with MultipleChoice question and multiple answers selected' do
      let(:multiple_choice_question) do
        create(:question, assessment: assessment, name: 'Multiple Choice Question', type: 'MultipleChoice')
      end
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: [multiple_choice_question.id])
      end
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
                 multiple_choice_question.id.to_s => {
                   'answers' => [
                     { 'index' => 0, 'value' => true },
                     { 'index' => 2, 'value' => true }
                   ],
                   'question_id' => multiple_choice_question.id
                 }
               })
      end

      before do
        user_assessment.update!(users_result: users_result)
        multiple_choice_question.update!(props: {
          'questionText' => 'Which programming languages do you know?',
          'choicesTexts' => %w[JavaScript Python Ruby Java],
          'type' => 'MultipleAnswer'
        })
      end

      it 'successfully parses multiple answers for MultipleChoice question' do
        result = subject.parse

        expect(result).to include('<assessments>')
        expect(result).to include('<assessment>')
        expect(result).to include("<id>#{assessment.id}</id>")
        expect(result).to include("<name>#{assessment.name}</name>")
        expect(result).to include('<questions>')
        expect(result).to include("<id>#{multiple_choice_question.id}</id>")
        expect(result).to include('<text>Which programming languages do you know?</text>')
        expect(result).to include('<options>')
        expect(result).to include('<option index="0">JavaScript</option>')
        expect(result).to include('<option index="1">Python</option>')
        expect(result).to include('<option index="2">Ruby</option>')
        expect(result).to include('<option index="3">Java</option>')
        expect(result).to include('</options>')
        expect(result).to include('<user_answer>JavaScript, Ruby</user_answer>')
        expect(result).to include('</questions>')
        expect(result).to include('</assessment>')
        expect(result).to include('</assessments>')
      end
    end

    context 'with TextEntry question' do
      let(:text_entry_question) do
        create(:question, assessment: assessment, name: 'Text Entry Question', type: 'TextEntry')
      end
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: [text_entry_question.id])
      end
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
                 text_entry_question.id.to_s => {
                   'answers' => [
                     { 'index' => 0, 'value' => 'This is my text response for the question.' }
                   ],
                   'question_id' => text_entry_question.id
                 }
               })
      end

      before do
        user_assessment.update!(users_result: users_result)
        text_entry_question.update!(props: {
          'questionText' => 'Please describe your experience:',
          'type' => 'SingleLine'
        })
      end

      it 'successfully parses TextEntry question response' do
        result = subject.parse

        expect(result).to include('<assessments>')
        expect(result).to include('<assessment>')
        expect(result).to include("<id>#{assessment.id}</id>")
        expect(result).to include("<name>#{assessment.name}</name>")
        expect(result).to include('<questions>')
        expect(result).to include("<id>#{text_entry_question.id}</id>")
        expect(result).to include('<text>Please describe your experience:</text>')
        expect(result).to include('<user_answer>This is my text response for the question.</user_answer>')
        expect(result).to include('</questions>')
        expect(result).to include('</assessment>')
        expect(result).to include('</assessments>')
      end
    end

    context 'with TextEntry Form question' do
      let(:text_entry_form_question) do
        create(:question, assessment: assessment, name: 'Text Entry Form Question', type: 'TextEntry')
      end
      let(:campaign_assistant_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               questions: [text_entry_form_question.id])
      end
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
                 text_entry_form_question.id.to_s => {
                   'answers' => [
                     { 'index' => 0, 'value' => 'John Doe' },
                     { 'index' => 1, 'value' => 'john.doe@example.com' },
                     { 'index' => 2, 'value' => 'Software Engineer' }
                   ],
                   'question_id' => text_entry_form_question.id
                 }
               })
      end

      before do
        user_assessment.update!(users_result: users_result)
        text_entry_form_question.update!(props: {
          'questionText' => 'Please fill out your contact information:',
          'type' => 'Form',
          'choicesTexts' => ['Full Name', 'Email Address', 'Job Title']
        })
      end

      it 'successfully parses TextEntry Form question with multiple fields' do
        result = subject.parse

        expect(result).to include('<assessments>')
        expect(result).to include('<assessment>')
        expect(result).to include("<id>#{assessment.id}</id>")
        expect(result).to include("<name>#{assessment.name}</name>")
        expect(result).to include('<questions>')
        expect(result).to include("<id>#{text_entry_form_question.id}</id>")
        expect(result).to include('<text>Please fill out your contact information:</text>')
        expect(result).to include('<options>')
        expect(result).to include('<option index="0">Full Name</option>')
        expect(result).to include('<option index="1">Email Address</option>')
        expect(result).to include('<option index="2">Job Title</option>')
        expect(result).to include('</options>')
        expect(result).to include(
          '<user_answer>Full Name: John Doe; Email Address: john.doe@example.com; ' \
          'Job Title: Software Engineer</user_answer>'
        )
        expect(result).to include('</questions>')
        expect(result).to include('</assessment>')
        expect(result).to include('</assessments>')
      end
    end
  end
end
