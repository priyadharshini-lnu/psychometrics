# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::RequirementsCalculator do
  subject(:result) { described_class.call!(campaign_user) }

  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }

  before do
    create(:campaign_assessment, campaign: campaign, assessment: assessment)
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: user)
  end

  describe '#call' do
    it 'returns browser as always required' do
      expect(result[:browser]).to eq({ required: true })
    end

    it 'returns network as not required when no speed check question types' do
      expect(result[:network][:required]).to be false
      expect(result[:network][:minimum_download_speed]).to be_present
      expect(result[:network][:minimum_upload_speed]).to be_present
    end

    context 'when campaign has no video questions' do
      it 'returns video as not required' do
        expect(result[:video]).to eq({
          required: false,
          face_detection_enabled: false,
          minimum_face_detection_ratio: 85,
          phrase_verification_enabled: false
        })
      end
    end

    context 'when campaign has no audio questions' do
      it 'returns audio as not required' do
        expect(result[:audio]).to eq({
          required: false,
          phrase_verification_enabled: false
        })
      end
    end

    context 'when campaign has audio response questions' do
      before do
        create(:question, assessment: assessment, type: 'AudioResponse')
      end

      it 'returns network as required' do
        expect(result[:network][:required]).to be true
      end

      it 'returns audio as required' do
        expect(result[:audio]).to eq({
          required: true,
          phrase_verification_enabled: false
        })
      end
    end

    context 'when campaign has both audio and video questions' do
      before do
        create(:question, assessment: assessment, type: 'AudioResponse')
        create(:question, assessment: assessment, type: 'VideoResponse')
      end

      it 'returns video as required' do
        expect(result[:video]).to eq({
          required: true,
          face_detection_enabled: false,
          minimum_face_detection_ratio: 85,
          phrase_verification_enabled: false
        })
      end

      it 'returns audio as not required since video covers audio' do
        expect(result[:audio]).to eq({
          required: false,
          phrase_verification_enabled: false
        })
      end
    end

    context 'when campaign has file upload questions' do
      before do
        create(:question, assessment: assessment, type: 'FileUpload')
      end

      it 'returns network as required' do
        expect(result[:network][:required]).to be true
      end
    end

    context 'when campaign has video questions' do
      before do
        create(:question, assessment: assessment, type: 'VideoResponse')
      end

      it 'returns video as required' do
        expect(result[:video]).to eq({
          required: true,
          face_detection_enabled: false,
          minimum_face_detection_ratio: 85,
          phrase_verification_enabled: false
        })
      end
    end

    context 'when no admin speeds configured' do
      it 'falls back to calculated speeds' do
        expect(result[:network][:minimum_download_speed]).to eq(1)
        expect(result[:network][:minimum_upload_speed]).to eq(1)
      end
    end

    context 'when campaign has configured minimum speeds' do
      before do
        campaign.campaign_options.update!(minimum_download_speed: 20, minimum_upload_speed: 25)
      end

      it 'returns the configured speeds' do
        expect(result[:network][:minimum_download_speed]).to eq(20)
        expect(result[:network][:minimum_upload_speed]).to eq(25)
      end
    end

    context 'with a threesixty campaign' do
      let(:threesixty_assessment) { create(:assessment, category: 'threesixty') }
      let(:campaign) { create(:campaign, :threesixty, project: project) }
      let(:threesixty_campaign) do
        create(:threesixty_campaign, campaign: campaign, assessment: threesixty_assessment)
      end
      let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }

      before do
        create(:campaign_assessment, campaign: campaign, assessment: threesixty_assessment)
        create(:user_assessment, campaign: campaign, assessment: threesixty_assessment, subject: user)
      end

      it 'returns browser as required' do
        expect(result[:browser]).to eq({ required: true })
      end

      context 'when threesixty option has configured minimum speeds' do
        before do
          threesixty_option.update!(
            participants: { 'global' => { 'minimum_download_speed' => 15, 'minimum_upload_speed' => 10 } }
          )
        end

        it 'returns the configured speeds from threesixty option' do
          expect(result[:network][:minimum_download_speed]).to eq(15)
          expect(result[:network][:minimum_upload_speed]).to eq(10)
        end
      end

      context 'when threesixty assessment has video questions' do
        before do
          create(:question, assessment: threesixty_assessment, type: 'VideoResponse')
        end

        it 'returns video as required' do
          expect(result[:video]).to eq({
            required: true,
            face_detection_enabled: false,
            minimum_face_detection_ratio: 85,
            phrase_verification_enabled: false
          })
        end
      end

      context 'when threesixty assessment has no video questions' do
        it 'returns video as not required' do
          expect(result[:video]).to eq({
            required: false,
            face_detection_enabled: false,
            minimum_face_detection_ratio: 85,
            phrase_verification_enabled: false
          })
        end
      end
    end

    context 'when user belongs to multiple campaigns' do
      let(:other_campaign) { create(:campaign, project: project) }
      let(:other_assessment) { create(:assessment) }

      before do
        create(:campaign_assessment, campaign: other_campaign, assessment: other_assessment)
        create(:user_assessment, campaign: other_campaign, assessment: other_assessment, subject: user)
        create(:question, assessment: other_assessment, type: 'VideoResponse')
      end

      it 'does not consider video questions from other campaigns' do
        expect(result[:video]).to eq({
          required: false,
          face_detection_enabled: false,
          minimum_face_detection_ratio: 85,
          phrase_verification_enabled: false
        })
      end
    end
  end
end
