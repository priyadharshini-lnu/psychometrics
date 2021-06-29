# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessment, type: :model do
  it {
    should define_enum_for(:status).
      with_values(not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5)
  }

  describe '#saville_user_reports' do
    it 'returns saville user_reports' do
    end

    it 'returns chainable empty ActiveRecord::Relation object if there are no saville user_report' do
      user_assessment = create(:user_assessment)
      saville_user_reports = user_assessment.saville_user_reports

      expect(saville_user_reports.is_a?(ActiveRecord::Relation)).to eq(true)
      expect(saville_user_reports.count).to eq(0)
    end
  end

  describe '#applicable_saville_norm_id' do
    it 'returns saville_norm_id of campaign_assessment if present' do
      campaign_assessment = create(:campaign_assessment, saville_norm_id: 'abc')
      user_assessment = create(:user_assessment, campaign_id: campaign_assessment.campaign_id,
        assessment_id: campaign_assessment.assessment_id)

      expect(user_assessment.applicable_saville_norm_id).to eq(campaign_assessment.saville_norm_id)
    end

    it 'returns saville_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :saville)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_saville_norm_id).to eq(assessment.saville_norm_id)
    end
  end

  describe '#norm_name' do
    it 'returns saville_norm_name is assessment is saville' do
      saville_assessment = build(:assessment, :saville)
      user_assessment = build(:user_assessment, assessment: saville_assessment)
      build(:saville_user_assessment,
            user_assessment: user_assessment, norm_id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337')

      expect(user_assessment.norm_name).to eq('Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)')
    end

    it 'returns regular norm name using norm_id column' do
      norm = create(:norm)
      user_assessment = build(:user_assessment, norm: norm)

      expect(user_assessment.norm_name).to eq(norm.name)
    end
  end
end
