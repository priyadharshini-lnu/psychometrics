# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::ContentAnalysis::TriggerAIScoringJob, type: :job do
  let(:dimension) { create(:dimension) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:ai_assistant) { create(:assistant) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, campaign: campaign, status: :completed) }
  let(:users_result) { user_assessment.users_result }
  let(:factor) { create(:factor, dimension: dimension) }

  before do
    assessment.update!(ai_assistant: ai_assistant)
  end

  def create_scorable_question
    question = create(:question, :ai_scored, assessment: assessment)
    create(:factors_scoring, factor: factor, question: question, assessment: assessment)
    question
  end

  describe '#perform' do
    subject(:perform_job) { described_class.new.perform(users_result.id) }

    context 'when assessment has no AI questions' do
      it 'does not mark as pending' do
        expect { perform_job }.not_to(change { users_result.reload.ai_scoring_status })
      end
    end

    context 'when ai_content_analysis global setting is disabled' do
      before do
        create_scorable_question
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(false)
      end

      it 'does not mark as pending' do
        expect { perform_job }.not_to(change { users_result.reload.ai_scoring_status })
      end

      it 'does not enqueue ScoreQuestionJob' do
        expect(AI::ContentAnalysis::ScoreQuestionJob).not_to receive(:perform_later)
        perform_job
      end
    end

    context 'when project feature is disabled' do
      before do
        create_scorable_question
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: false)
      end

      it 'does not mark as pending' do
        expect { perform_job }.not_to(change { users_result.reload.ai_scoring_status })
      end
    end

    context 'when all features are enabled' do
      let!(:question) { create_scorable_question }

      before do
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: true)
      end

      it 'marks as pending' do
        perform_job
        expect(users_result.reload).to be_ai_scoring_pending
      end

      context 'when ready for AI scoring (no transcription questions)' do
        it 'enqueues ScoreQuestionJob for each scorable question' do
          expect(AI::ContentAnalysis::ScoreQuestionJob).to receive(:perform_later).with(
            users_result.id,
            question.id,
            rescore: false,
            admin_job_record_id: nil
          )
          perform_job
        end
      end

      context 'when transcriptions are pending' do
        let!(:video_question) do
          create(:question, :ai_scored, :transcription_enabled, assessment: assessment, type: 'VideoResponse')
        end

        before do
          allow_any_instance_of(MediaResponse).to receive(:customize_attachment_path)
          allow_any_instance_of(MediaResponse).to receive_message_chain(:asset, :attached?).and_return(true)
          create(:media_response, users_result: users_result, question: video_question,
transcription_status: :processing)
        end

        it 'marks as pending but does not enqueue ScoreQuestionJob' do
          expect(AI::ContentAnalysis::ScoreQuestionJob).not_to receive(:perform_later)
          perform_job
          expect(users_result.reload).to be_ai_scoring_pending
        end
      end
    end

    context 'when already processing and rescore is false' do
      before do
        create_scorable_question
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: true)
        users_result.ai_scoring_processing!
      end

      it 'does not process again' do
        expect(AI::ContentAnalysis::ScoreQuestionJob).not_to receive(:perform_later)
        perform_job
      end
    end

    context 'when already completed and rescore is true' do
      let!(:question) { create_scorable_question }

      before do
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: true)
        users_result.ai_scoring_completed!
      end

      it 'processes again with rescore' do
        expect(AI::ContentAnalysis::ScoreQuestionJob).to receive(:perform_later).with(
          users_result.id,
          question.id,
          rescore: true,
          admin_job_record_id: nil
        )
        described_class.new.perform(users_result.id, rescore: true)
      end
    end
  end
end
