# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::RegenerateAssessmentTranscriptionsJob do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let(:owner) { create(:user) }

  let(:job_record) do
    create(
      :admin_job_record,
      operation: :regenerate_assessment_transcriptions,
      owner: owner,
      data: {
        'campaign_id' => campaign.id,
        'campaign_assessment_id' => campaign_assessment.id
      }
    )
  end

  subject { described_class.new(job_record) }

  describe '.validate' do
    it 'raises error when campaign_id is blank' do
      expect do
        described_class.validate({ campaign_assessment_id: 1 }, owner)
      end.to raise_error(ArgumentError, 'campaign_id is required')
    end

    it 'raises error when campaign_assessment_id is blank' do
      expect do
        described_class.validate({ campaign_id: 1 }, owner)
      end.to raise_error(ArgumentError, 'campaign_assessment_id is required')
    end

    it 'does not raise error when both ids are present' do
      expect do
        described_class.validate({ campaign_id: 1, campaign_assessment_id: 1 }, owner)
      end.not_to raise_error
    end
  end

  describe '#valid?' do
    context 'when campaign and campaign_assessment exist' do
      it 'returns true' do
        expect(subject.valid?).to be true
      end
    end

    context 'when campaign does not exist' do
      before do
        job_record.data['campaign_id'] = -1
      end

      it 'returns false' do
        expect(subject.valid?).to be false
      end
    end

    context 'when campaign_assessment does not exist' do
      before do
        job_record.data['campaign_assessment_id'] = -1
      end

      it 'returns false' do
        expect(subject.valid?).to be false
      end
    end
  end

  describe '#call' do
    let(:video_question) do
      create(:question,
             :transcription_enabled,
             assessment: assessment,
             type: 'VideoResponse',
             props: { 'enableTranscription' => 'true' })
    end

    context 'when there are no transcription-enabled questions' do
      it 'broadcasts :ok with zero tasks' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
        expect(job_record.reload.total_tasks).to eq(0)
      end
    end

    context 'when there are no media responses with incomplete transcriptions' do
      before { video_question }

      it 'broadcasts :ok with zero tasks' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
        expect(job_record.reload.total_tasks).to eq(0)
      end
    end

    context 'when there are media responses with incomplete transcriptions' do
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
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :pending)
      end

      it 'sets total_tasks to the count of media responses' do
        subject.call
        expect(job_record.reload.total_tasks).to eq(1)
      end

      it 'broadcasts :waiting' do
        expect(subject).to receive(:broadcast).with(:waiting)
        subject.call
      end

      it 'enqueues a RegenerateTranscriptionJob for each media response' do
        expect(MediaResponses::RegenerateTranscriptionJob).to receive(:perform_later).with(
          media_response.id,
          job_record.id
        )
        subject.call
      end

      context 'with multiple media responses' do
        let!(:media_response2) do
          create(:media_response,
                 question: video_question,
                 users_result: users_result,
                 transcription_status: :failed)
        end

        it 'enqueues jobs for all pending media responses' do
          expect(MediaResponses::RegenerateTranscriptionJob).to receive(:perform_later).twice
          subject.call
          expect(job_record.reload.total_tasks).to eq(2)
        end
      end
    end

    context 'when transcription status is completed' do
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
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :completed)
      end

      it 'does not include media responses with completed transcriptions' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
        expect(job_record.reload.total_tasks).to eq(0)
      end
    end

    context 'when transcription status is processing' do
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
      let!(:media_response) do
        create(:media_response,
               question: video_question,
               users_result: users_result,
               transcription_status: :processing)
      end

      it 'includes processing transcriptions (worker handles stale check)' do
        expect(subject).to receive(:broadcast).with(:waiting)
        subject.call
        expect(job_record.reload.total_tasks).to eq(1)
      end
    end
  end

  describe '#generate_title_link' do
    it 'returns href and label' do
      result = subject.generate_title_link

      expect(result[:href]).to be_present
      expect(result[:label]).to eq("#{campaign.name} - #{assessment.name}")
    end
  end
end
