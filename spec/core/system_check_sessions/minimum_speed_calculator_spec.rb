# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::MinimumSpeedCalculator do
  subject(:result) { described_class.call!(campaign_user: campaign_user) }

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
    context 'when user has no audio or video questions and campaign is not proctored' do
      it 'returns base speed' do
        expect(result).to eq({ download: 1, upload: 1 })
      end
    end

    context 'when user has audio questions' do
      before do
        create(:question, assessment: assessment, type: 'AudioResponse')
      end

      it 'returns audio speed' do
        expect(result).to eq({ download: 1, upload: 2 })
      end
    end

    context 'when user has video questions' do
      before do
        create(:question, assessment: assessment, type: 'VideoResponse')
      end

      it 'returns video speed' do
        expect(result).to eq({ download: 1, upload: 5 })
      end
    end

    context 'when user has both audio and video questions' do
      before do
        create(:question, assessment: assessment, type: 'AudioResponse')
        create(:question, assessment: assessment, type: 'VideoResponse')
      end

      it 'returns video speed (video takes precedence)' do
        expect(result).to eq({ download: 1, upload: 5 })
      end
    end

    context 'when campaign is proctored' do
      before do
        campaign.campaign_options.update!(proctoring_enabled: true)
      end

      it 'returns proctored speed' do
        expect(result).to eq({ download: 2, upload: 3 })
      end
    end

    context 'when campaign is proctored and user has video questions' do
      before do
        campaign.campaign_options.update!(proctoring_enabled: true)
        create(:question, assessment: assessment, type: 'VideoResponse')
      end

      it 'returns proctored_video speed' do
        expect(result).to eq({ download: 3, upload: 8 })
      end
    end

    context 'when assessment has deleted questions' do
      before do
        create(:question, assessment: assessment, type: 'VideoResponse', deleted_at: Time.current)
      end

      it 'ignores deleted questions and returns base speed' do
        expect(result).to eq({ download: 1, upload: 1 })
      end
    end

    context 'when user has multiple assessments' do
      let(:second_assessment) { create(:assessment) }

      before do
        create(:campaign_assessment, campaign: campaign, assessment: second_assessment)
        create(:user_assessment, campaign: campaign, assessment: second_assessment, subject: user)
        create(:question, assessment: second_assessment, type: 'VideoResponse')
      end

      it 'checks questions across all user assessments' do
        expect(result).to eq({ download: 1, upload: 5 })
      end
    end

    context 'when user has individual assessment not in campaign' do
      let(:individual_assessment) { create(:assessment) }

      before do
        create(:user_assessment, campaign: campaign, assessment: individual_assessment, subject: user)
        create(:question, assessment: individual_assessment, type: 'VideoResponse')
      end

      it 'includes individually assigned assessments in calculation' do
        expect(result).to eq({ download: 1, upload: 5 })
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

      it 'only considers assessments from the current campaign' do
        expect(result).to eq({ download: 1, upload: 1 })
      end
    end

    context 'when called with campaign only (no campaign_user)' do
      subject(:result) { described_class.call!(campaign: campaign) }

      it 'returns base speed when no relevant questions' do
        expect(result).to eq({ download: 1, upload: 1 })
      end

      context 'when campaign has video questions' do
        before do
          create(:question, assessment: assessment, type: 'VideoResponse')
        end

        it 'returns video speed based on campaign assessments' do
          expect(result).to eq({ download: 1, upload: 5 })
        end
      end

      context 'when campaign is proctored with video questions' do
        before do
          campaign.campaign_options.update!(proctoring_enabled: true)
          create(:question, assessment: assessment, type: 'VideoResponse')
        end

        it 'returns proctored_video speed' do
          expect(result).to eq({ download: 3, upload: 8 })
        end
      end
    end
  end
end
