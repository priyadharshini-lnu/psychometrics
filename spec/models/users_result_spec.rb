# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResult, type: :model do
  describe '#all_transcriptions_completed?' do
    let(:assessment) { create(:assessment) }
    let(:user_assessment) { create(:user_assessment, assessment:) }
    let(:users_result) { create(:users_result, user_assessment:) }

    subject(:result) { users_result.all_transcriptions_completed? }

    def create_question(type:, props: {})
      create(
        :question,
        :ai_scored,
        assessment:,
        type:,
        props:
      )
    end

    def create_media_response_with_asset(question:, transcription_status:, user_selected: nil)
      attrs = {
        users_result: users_result,
        question: question,
        transcription_status: transcription_status
      }
      attrs[:user_selected] = user_selected if user_selected

      response = create(:media_response, **attrs)
      response.asset.attach(
        io: StringIO.new('dummy media'),
        filename: "media-response-#{response.id}.mp4",
        content_type: 'video/mp4'
      )
      response
    end

    context 'when there are no transcription enabled media questions' do
      before do
        create_question(
          type: 'VideoResponse',
          props: { enableTranscription: false }
        )
      end

      it { is_expected.to be(true) }
    end

    context 'when transcription enabled question has no responses' do
      before do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'VideoResponse')
      end

      it { is_expected.to be(true) }
    end

    context 'when response exists but transcription is processing' do
      let!(:question) do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'AudioResponse')
      end

      before do
        create_media_response_with_asset(
          question: question,
          transcription_status: :processing
        )
      end

      it { is_expected.to be(false) }
    end

    context 'when selected response transcription is completed' do
      let!(:question) do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'VideoResponse')
      end

      before do
        create_media_response_with_asset(
          question: question,
          user_selected: true,
          transcription_status: :completed
        )
      end

      it { is_expected.to be(true) }
    end

    context 'when multiple selected responses exist' do
      let!(:question) do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'VideoResponse')
      end

      before do
        create_media_response_with_asset(
          question: question,
          user_selected: true,
          transcription_status: :completed
        )

        create_media_response_with_asset(
          question: question,
          user_selected: true,
          transcription_status: :processing
        )
      end

      it { is_expected.to be(false) }
    end

    context 'when no response is selected but completed one exists' do
      let!(:question) do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'AudioResponse')
      end

      before do
        create_media_response_with_asset(
          question: question,
          transcription_status: :completed
        )

        create_media_response_with_asset(
          question: question,
          transcription_status: :processing
        )
      end

      it { is_expected.to be(false) }
    end

    context 'when response has no attached asset' do
      let!(:question) do
        create(:question, :transcription_enabled, :ai_scored,
               assessment:, type: 'VideoResponse')
      end

      before do
        create(:media_response,
               users_result:, question:,
               transcription_status: :completed)
      end

      it { is_expected.to be(true) }
    end
  end

  describe '#ai_content_analysis_enabled?' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:assessment) { create(:assessment) }
    let(:user_assessment) { create(:user_assessment, assessment: assessment, campaign: campaign) }
    let(:users_result) { user_assessment.users_result }

    subject(:result) { users_result.ai_content_analysis_enabled? }

    context 'when project is blank' do
      before do
        allow(users_result).to receive_message_chain(:campaign, :project).and_return(nil)
      end

      it { is_expected.to be(false) }
    end

    context 'when global setting is disabled' do
      before do
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(false)
      end

      it { is_expected.to be(false) }
    end

    context 'when project feature is disabled' do
      before do
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: false)
      end

      it { is_expected.to be(false) }
    end

    context 'when all features are enabled' do
      before do
        allow(Settings.features).to receive(:ai_content_analysis_enabled).and_return(true)
        project.project_feature&.update(ai_content_analysis: true)
      end

      it { is_expected.to be(true) }
    end
  end
end
