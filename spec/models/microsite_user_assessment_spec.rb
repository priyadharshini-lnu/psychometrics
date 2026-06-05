# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MicrositeUserAssessment, type: :model do
  describe 'associations' do
    it { should belong_to(:user_assessment) }
  end

  describe 'factory' do
    it 'has a valid factory' do
      user_assessment = create(:user_assessment)
      microsite_user_assessment = build(:microsite_user_assessment, user_assessment: user_assessment)
      expect(microsite_user_assessment).to be_valid
    end
  end

  describe 'delegate' do
    it 'delegates user_reports to user_assessment' do
      user_assessment = create(:user_assessment)
      microsite_user_assessment = create(:microsite_user_assessment, user_assessment: user_assessment)
      expect(microsite_user_assessment).to respond_to(:user_reports)
    end
  end

  describe 'callbacks' do
    describe 'before_destroy :cancel_on_microsite' do
      let(:user_assessment) { create(:user_assessment) }

      context 'when registered with participant_id' do
        let(:microsite_user_assessment) do
          create(:microsite_user_assessment,
                 user_assessment: user_assessment,
                 registration_status: :registered,
                 participant_id: 'participant-123')
        end

        it 'enqueues CancelParticipantJob' do
          expect(Microsite::CancelParticipantJob).to receive(:perform_later).with(
            participant_id: 'participant-123',
            project_id: user_assessment.project.id
          )

          microsite_user_assessment.destroy
        end
      end

      context 'when not registered' do
        let(:microsite_user_assessment) do
          create(:microsite_user_assessment,
                 user_assessment: user_assessment,
                 registration_status: :pending,
                 participant_id: 'participant-123')
        end

        it 'does not enqueue CancelParticipantJob' do
          expect(Microsite::CancelParticipantJob).not_to receive(:perform_later)

          microsite_user_assessment.destroy
        end
      end

      context 'when participant_id is blank' do
        let(:microsite_user_assessment) do
          create(:microsite_user_assessment,
                 user_assessment: user_assessment,
                 registration_status: :registered,
                 participant_id: nil)
        end

        it 'does not enqueue CancelParticipantJob' do
          expect(Microsite::CancelParticipantJob).not_to receive(:perform_later)

          microsite_user_assessment.destroy
        end
      end
    end
  end
end
