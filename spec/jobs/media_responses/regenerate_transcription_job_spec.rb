# frozen_string_literal: true

require 'rails_helper'

describe MediaResponses::RegenerateTranscriptionJob do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let(:owner) { create(:user) }
  let(:video_question) do
    create(:question,
           :transcription_enabled,
           assessment: assessment,
           type: 'VideoResponse',
           props: { 'enableTranscription' => 'true' })
  end
  let(:users_result) do
    create(:users_result,
           campaign: campaign,
           assessment: assessment,
           without_user_assessment: true)
  end
  let!(:user_assessment) do
    create(:user_assessment,
           campaign: campaign,
           assessment: assessment,
           users_result: users_result)
  end
  let(:admin_job_record) do
    create(
      :admin_job_record,
      operation: :regenerate_assessment_transcriptions,
      owner: owner,
      total_tasks: 5,
      data: {
        'campaign_id' => campaign.id,
        'campaign_assessment_id' => campaign_assessment.id
      }
    )
  end

  describe '#perform' do
    context 'when media response does not exist' do
      it 'does not call the transcription service' do
        expect(MediaResponses::Transcriptions::Oci).not_to receive(:call!)
        expect(MediaResponses::Transcriptions::Faas).not_to receive(:call!)

        described_class.new.perform(-1, admin_job_record.id)
      end
    end

    context 'when asset is not attached' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :pending)
      end

      it 'does not call the transcription service' do
        allow(media_response).to receive_message_chain(:asset, :attached?).and_return(false)
        allow(MediaResponse).to receive(:find_by).with(id: media_response.id).and_return(media_response)

        expect(MediaResponses::Transcriptions::Oci).not_to receive(:call!)
        expect(MediaResponses::Transcriptions::Faas).not_to receive(:call!)

        described_class.new.perform(media_response.id, admin_job_record.id)
      end
    end

    context 'when transcription is already completed' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :completed)
      end

      it 'does not call the transcription service' do
        expect(MediaResponses::Transcriptions::Oci).not_to receive(:call!)
        expect(MediaResponses::Transcriptions::Faas).not_to receive(:call!)

        described_class.new.perform(media_response.id, admin_job_record.id)
      end

      it 'increments completed_tasks on the admin job record' do
        described_class.new.perform(media_response.id, admin_job_record.id)
        expect(admin_job_record.reload.completed_tasks).to eq(1)
      end
    end

    context 'when transcription is already processing' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :processing)
      end

      it 'does not call the transcription service' do
        expect(MediaResponses::Transcriptions::Oci).not_to receive(:call!)
        expect(MediaResponses::Transcriptions::Faas).not_to receive(:call!)

        described_class.new.perform(media_response.id, admin_job_record.id)
      end

      it 'increments completed_tasks on the admin job record' do
        described_class.new.perform(media_response.id, admin_job_record.id)
        expect(admin_job_record.reload.completed_tasks).to eq(1)
      end
    end

    context 'when provider is oci' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :pending)
      end

      before do
        allow(Settings.ai_transcription_provider).to receive(:provider).and_return('oci')
        allow(MediaResponses::Transcriptions::Oci).to receive(:call!)
        # Stub asset.attached? to return true for testing
        mr = MediaResponse.find(media_response.id)
        allow(MediaResponse).to receive(:find_by).with(id: media_response.id).and_return(mr)
        allow(mr).to receive_message_chain(:asset, :attached?).and_return(true)
      end

      it 'calls OCI transcription service' do
        described_class.new.perform(media_response.id, admin_job_record.id)

        expect(MediaResponses::Transcriptions::Oci).to have_received(:call!).with(
          media_response: an_instance_of(MediaResponse),
          admin_job_record_id: admin_job_record.id
        )
      end
    end

    context 'when provider is faas' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :pending)
      end

      before do
        allow(Settings.ai_transcription_provider).to receive(:provider).and_return('faas')
        allow(MediaResponses::Transcriptions::Faas).to receive(:call!)
        # Stub asset.attached? to return true for testing
        mr = MediaResponse.find(media_response.id)
        allow(MediaResponse).to receive(:find_by).with(id: media_response.id).and_return(mr)
        allow(mr).to receive_message_chain(:asset, :attached?).and_return(true)
      end

      it 'calls FaaS transcription service' do
        described_class.new.perform(media_response.id, admin_job_record.id)

        expect(MediaResponses::Transcriptions::Faas).to have_received(:call!).with(
          media_response: an_instance_of(MediaResponse),
          admin_job_record_id: admin_job_record.id
        )
      end
    end

    context 'without admin_job_record_id' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :pending)
      end

      before do
        allow(Settings.ai_transcription_provider).to receive(:provider).and_return('oci')
        allow(MediaResponses::Transcriptions::Oci).to receive(:call!)
        # Stub asset.attached? to return true for testing
        mr = MediaResponse.find(media_response.id)
        allow(MediaResponse).to receive(:find_by).with(id: media_response.id).and_return(mr)
        allow(mr).to receive_message_chain(:asset, :attached?).and_return(true)
      end

      it 'still calls transcription service' do
        described_class.new.perform(media_response.id, nil)

        expect(MediaResponses::Transcriptions::Oci).to have_received(:call!).with(
          media_response: an_instance_of(MediaResponse),
          admin_job_record_id: nil
        )
      end
    end

    context 'when transcription is stale processing (over 1 hour)' do
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :processing)
      end

      before do
        # Make transcription stale (updated more than 1 hour ago)
        media_response.transcription.update_column(:updated_at, 2.hours.ago)

        allow(Settings.ai_transcription_provider).to receive(:provider).and_return('oci')
        allow(MediaResponses::Transcriptions::Oci).to receive(:call!)
        # Stub asset.attached? to return true for testing
        mr = MediaResponse.find(media_response.id)
        allow(MediaResponse).to receive(:find_by).with(id: media_response.id).and_return(mr)
        allow(mr).to receive_message_chain(:asset, :attached?).and_return(true)
      end

      it 'calls the transcription service for stale processing' do
        described_class.new.perform(media_response.id, admin_job_record.id)

        expect(MediaResponses::Transcriptions::Oci).to have_received(:call!).with(
          media_response: an_instance_of(MediaResponse),
          admin_job_record_id: admin_job_record.id
        )
      end
    end
  end
end
