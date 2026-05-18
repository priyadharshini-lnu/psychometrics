# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Proctoring::GetProctoringCredits do
  let(:campaign_options) { create(:campaign_option, fixed_time_duration: 3600) }
  let(:campaign) { create(:campaign, campaign_options: campaign_options) }

  it 'returns right credits count' do
    result = described_class.call!(campaign)
    expect(result).to eq(6)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1680
    result = described_class.call!(campaign)
    expect(result).to eq(4)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1800
    result = described_class.call!(campaign)
    expect(result).to eq(4)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1860
    result = described_class.call!(campaign)
    expect(result).to eq(5)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 7200
    result = described_class.call!(campaign)
    expect(result).to eq(10)
  end
  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 7260
    result = described_class.call!(campaign)
    expect(result).to eq(11)
  end
  context 'when selective proctoring is enabled' do
    let!(:assessment1) { create(:assessment) }
    let!(:assessment2) { create(:assessment) }
    let!(:assessment3) { create(:assessment) }

    before do
      campaign_options.update(selective_proctoring_enabled: true)
      assessment1.update(extra: { 'timer' => 30 * 60 })
      assessment2.update(extra: { 'timer' => 45 * 60 })
      assessment3.update(extra: { 'timer' => 60 * 60 })
      create(:campaign_assessment, campaign: campaign, assessment: assessment1, proctoring_enabled: true)
      create(:campaign_assessment, campaign: campaign, assessment: assessment2, proctoring_enabled: true)
      create(:campaign_assessment, campaign: campaign, assessment: assessment3, proctoring_enabled: false)
    end

    context 'when user_assessment is not passed' do
      it 'returns nil' do
        result = described_class.call!(campaign)
        expect(result).to be_nil
      end
    end

    context 'when user_assessment is passed' do
      let(:user_assessment) { build_stubbed(:user_assessment, assessment: assessment1, campaign: campaign) }
      let(:user_assessment_with_checks) { build_stubbed(:user_assessment, assessment: assessment2, campaign: campaign) }

      it 'calculates credits for a single assessment including 5 min base buffer time' do
        result = described_class.call!(campaign, user_assessment)
        expect(result).to eq(5)
      end

      context 'when assessment requires system checks' do
        before do
          assessment2.update(extra: { 'timer' => 20 * 60, 'enable_video_check' => true })
        end

        it 'adds an additional 10 minutes buffer (15 total)' do
          result = described_class.call!(campaign, user_assessment_with_checks)
          expect(result).to eq(5)
        end
      end

      context 'when assessment has audio/video questions without explicit check flags' do
        let(:assessment_with_audio) { create(:assessment) }
        let(:user_assessment_audio) { create(:user_assessment, assessment: assessment_with_audio, campaign: campaign) }

        before do
          create(:campaign_assessment, campaign: campaign, assessment: assessment_with_audio, proctoring_enabled: true)
          assessment_with_audio.update(extra: { 'timer' => 20 * 60 })
          create(:question, assessment: assessment_with_audio, type: 'AudioResponse')
        end

        it 'adds system check buffer due to audio question presence' do
          result = described_class.call!(campaign, user_assessment_audio)
          expect(result).to eq(5)
        end
      end
    end
  end
end
