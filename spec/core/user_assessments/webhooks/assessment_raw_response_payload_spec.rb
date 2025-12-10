# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::Webhooks::AssessmentRawResponsePayload do
  describe '#call' do
    let(:campaign) { create(:campaign) }
    let(:assessment) { create(:assessment, category: Assessment::PSYCHOMETRIC) }
    let(:subject_user) { create(:user) }
    let(:user_assessment) do
      create(:user_assessment, campaign: campaign, assessment: assessment, subject: subject_user, status: 'completed')
    end
    let!(:users_result) { create(:users_result, user_assessment: user_assessment, answers: {}) }

    subject(:payload) { described_class.new(user_assessment).call }

    before do
      user_assessment.reload
    end

    it 'returns a hash with the correct top-level keys' do
      expect(payload.keys).to contain_exactly(:campaign, :assessment, :subject, :event_time, :answers)
    end

    it 'returns the correct campaign, assessment, and subject' do
      expect(payload[:campaign]).to eq(campaign)
      expect(payload[:assessment]).to eq(assessment)
      expect(payload[:subject]).to eq(subject_user)
    end

    it 'returns the correct event_time' do
      expect(payload[:event_time]).to eq(user_assessment.completed_at)
    end

    context 'when there are no questions' do
      it 'returns an empty answers hash' do
        expect(payload[:answers]).to be_empty
      end
    end

    context 'when there are questions and answers' do
      let(:block) { create(:block, assessment: assessment) }
      let!(:question1) do
        create(:question, type: 'MultipleChoice', block: block, assessment: assessment,
props: { 'questionText' => 'Question 1' })
      end
      let!(:question2) do
        create(:question, type: 'TextEntry', block: block, assessment: assessment,
props: { 'questionText' => 'Question 2' })
      end
      let!(:question3) do
        # A question type that is not allowed
        create(:question, type: 'UnsupportedType', block: block, assessment: assessment)
      end

      let(:answers) do
        {
          question1.id.to_s => { 'choices' => ['a'], 'duration' => 10 },
          question2.id.to_s => { 'text' => 'My answer', 'duration' => 15 },
          question3.id.to_s => { 'text' => 'Some answer' }
        }
      end

      # Override users_result for this context to include answers from the start
      let!(:users_result) { create(:users_result, user_assessment: user_assessment, answers: answers) }

      it 'returns a non-empty answers hash' do
        expect(payload[:answers]).not_to be_empty
      end

      it 'has question IDs for the answered questions' do
        question_ids = payload[:answers].pluck(:question_id)
        expect(question_ids).to contain_exactly(question1.id, question2.id)
      end

      it 'does not include answers for unsupported question types' do
        question_ids = payload[:answers].pluck(:question_id)
        expect(question_ids).not_to include(question3.id)
      end

      context 'when an answer is blank' do
        let(:answers) do
          {
            question1.id.to_s => {}, # Blank answer
            question2.id.to_s => { 'text' => 'My answer', 'duration' => 15 }
          }
        end

        it 'does not include that answer in the payload' do
          question_ids = payload[:answers].pluck(:question_id)
          expect(question_ids).to contain_exactly(question2.id)
        end
      end

      context 'when an answer value is an empty string' do
        let(:answers) do
          {
            question2.id.to_s => { 'text' => '', 'duration' => 15 }
          }
        end

        it 'converts the empty string to nil' do
          answer_payload = payload[:answers].find { |a| a[:question_id] == question2.id }
          answer = answer_payload[:answers].first
          expect(answer[:value]).to be_nil
        end
      end
    end
  end
end
