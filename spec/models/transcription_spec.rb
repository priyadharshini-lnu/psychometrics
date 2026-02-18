# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transcription, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:transcribable) }
  end

  describe 'validations' do
    subject { create(:transcription) }

    it { is_expected.to validate_uniqueness_of(:transcribable_id).scoped_to(:transcribable_type) }
  end

  describe 'enums' do
    it do
      is_expected.to define_enum_for(:status).with_values(
        not_requested: 0,
        pending: 1,
        processing: 2,
        completed: 3,
        failed: 4
      )
    end
  end

  describe '#trigger_ai_scoring_if_ready' do
    let(:users_result) { create(:users_result) }
    let(:media_response) { create(:media_response, users_result: users_result) }
    let!(:transcription) { create(:transcription, transcribable: media_response, status: :processing) }

    context 'when status changes to completed' do
      it 'calls trigger_ai_scoring on users_result' do
        expect_any_instance_of(UsersResult).to receive(:trigger_ai_scoring)
        transcription.update!(status: :completed)
      end
    end

    context 'when status changes to failed' do
      it 'does not call trigger_ai_scoring' do
        expect_any_instance_of(UsersResult).not_to receive(:trigger_ai_scoring)
        transcription.update!(status: :failed)
      end
    end

    context 'when transcribable is not a MediaResponse' do
      let(:transcription) { create(:transcription, status: :processing) }

      before do
        allow(transcription).to receive(:transcribable).and_return(double('OtherModel'))
      end

      it 'does not call trigger_ai_scoring' do
        expect_any_instance_of(UsersResult).not_to receive(:trigger_ai_scoring)
        transcription.update!(status: :completed)
      end
    end
  end
end
