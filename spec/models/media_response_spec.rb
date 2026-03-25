# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponse, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy, used_number: 0) }
  let!(:assessment) { create(:assessment, type: Assessments::Common) }
  let!(:block) { create(:block, assessment: assessment) }
  let!(:question) { create(:question, assessment: assessment, block: block) }
  let!(:users_result) { create(:users_result) }

  it "doesn't allow media_responses more than max_takes specified in the question" do
    question = create(:question, assessment: assessment, props: { 'maxTakes' => 2 }, type: 'VideoResponse')
    media_response = create(:media_response, question: question, users_result: users_result)
    expect(media_response.persisted?).to eq(true)

    media_response = create(
      :media_response, question: question, users_result: users_result
    )
    expect(media_response.persisted?).to eq(true)

    media_response = build(
      :media_response, question: question, users_result: users_result
    )
    expect { media_response.save! }.to raise_error(
      ActiveRecord::RecordInvalid, 'Validation failed: Limit reached for maximum takes'
    )
  end

  it "maxTakes of one question doesn't effect other question" do
    question1 = create(:question, assessment: assessment, props: { 'maxTakes' => 1 }, type: 'VideoResponse')
    create(:media_response, question: question1, users_result: users_result)

    question2 = create(:question, type: 'VideoResponse', assessment: assessment)
    media_response2 = create(
      :media_response, question: question2, users_result: users_result
    )
    expect(media_response2.persisted?).to eq(true)
  end

  it 'prevents non existing questions' do
    media_response = create(:media_response, question: question)

    expect { media_response.question.delete }.to raise_error(ActiveRecord::InvalidForeignKey)
  end

  it 'deletes record if related :users_result is deleted' do
    media_response = create(:media_response, question: question)

    expect { media_response.users_result.delete }.to change(described_class, :count).by(-1)
  end

  describe 'transcription methods with stale association cache' do
    let(:media_response) { create(:media_response, question: question, users_result: users_result) }

    it 'handles stale association when transcription was created externally' do
      loaded_media_response = MediaResponse.find(media_response.id)
      expect(loaded_media_response.transcription).to be_nil

      Transcription.create!(transcribable: media_response, status: :pending)

      expect { loaded_media_response.save_transcription_status!(:processing) }.not_to raise_error

      expect(media_response.reload.transcription.status).to eq('processing')
    end

    it 'handles stale association when calling save_transcription_completed!' do
      loaded_media_response = MediaResponse.find(media_response.id)
      Transcription.create!(transcribable: media_response, status: :pending)

      expect { loaded_media_response.save_transcription_completed!('test text') }.not_to raise_error

      transcription = media_response.reload.transcription
      expect(transcription.status).to eq('completed')
      expect(transcription.text).to eq('test text')
    end

    it 'handles stale association when calling save_transcription_failed!' do
      loaded_media_response = MediaResponse.find(media_response.id)
      Transcription.create!(transcribable: media_response, status: :pending)

      error_details = { message: 'Test error' }
      expect { loaded_media_response.save_transcription_failed!(error_details) }.not_to raise_error

      transcription = media_response.reload.transcription
      expect(transcription.status).to eq('failed')
      expect(transcription.error_details).to eq({ 'message' => 'Test error' })
    end

    it 'creates transcription when none exists' do
      expect(media_response.transcription).to be_nil

      media_response.save_transcription_status!(:pending)

      expect(media_response.reload.transcription).to be_present
      expect(media_response.transcription.status).to eq('pending')
    end
  end
end
