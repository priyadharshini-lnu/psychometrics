# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignAssessment, type: :model do
  let(:saville_assessment) { create(:assessment, :saville) }

  describe '#norm_name' do
    it 'returns saville_norm_name is assessment is saville' do
      campaign_assessment = build(:campaign_assessment, external_norm_id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337',
        assessment: saville_assessment)

      expect(campaign_assessment.norm_name).to eq('Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)')
    end

    it 'returns regular norm name using norm_id column' do
      norm = create(:norm)
      campaign_assessment = build(:campaign_assessment, norm: norm)

      expect(campaign_assessment.norm_name).to eq(norm.name)
    end
  end

  describe '#update_norm' do
    it "updates saville_norm_id column it's a saville assessment" do
      campaign_assessment = create(:campaign_assessment, external_norm_id: '1', assessment: saville_assessment)
      campaign_assessment.update_norm!('2')

      expect(campaign_assessment.external_norm_id).to eq('2')
    end

    it 'updates norm_id for common assessment' do
      old_norm = create(:norm)
      new_norm = create(:norm)
      campaign_assessment = create(:campaign_assessment, norm: old_norm)
      campaign_assessment.update_norm!(new_norm.id)

      expect(campaign_assessment.norm_id).to eq(new_norm.id)
    end
  end
end
