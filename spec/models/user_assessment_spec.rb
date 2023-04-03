# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessment, type: :model do
  it {
    should define_enum_for(:status).
      with_values(not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5)
  }

  describe '#external_user_reports' do
    it 'returns saville user_reports' do
      assessment = create(:assessment, :saville)
      report = create(:report, :saville, assessments: [assessment])
      user_assessment = create(:user_assessment, assessment: assessment)
      user_report = create(:user_report, user_id: user_assessment.subject_id,
        report_id: report.id, campaign_id: user_assessment.campaign_id)
      saville_user_reports = user_assessment.external_user_reports(:saville)

      expect(saville_user_reports).to include(user_report)
    end

    it 'returns chainable empty ActiveRecord::Relation object if there are no saville user_report' do
      user_assessment = create(:user_assessment)
      saville_user_reports = user_assessment.external_user_reports(:saville)

      expect(saville_user_reports.is_a?(ActiveRecord::Relation)).to eq(true)
      expect(saville_user_reports.count).to eq(0)
    end
  end

  describe '#applicable_external_norm_id' do
    it 'returns external_norm_id of campaign_assessment if present' do
      campaign_assessment = create(:campaign_assessment, external_norm_id: 'abc')
      campaign_assessment.assessment.update(external_settings: { norm_id: 'abc' })
      user_assessment = create(:user_assessment, campaign_id: campaign_assessment.campaign_id,
        assessment_id: campaign_assessment.assessment_id)

      expect(user_assessment.applicable_external_norm_id).to eq(campaign_assessment.external_norm_id)
    end

    it 'returns saville_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :saville)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end

    it 'returns pearson_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :pearson)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end
  end

  describe '#norm_name' do
    it 'returns saville_norm_name is assessment is saville' do
      user_assessment = build(
        :user_assessment,
        assessment: build(
          :assessment,
          :saville,
          external_settings: { assessment_id: 'A830E4AB-BC66-4238-92E0-6E6FD3FD1EDF' }
        )
      )
      build(
        :saville_user_assessment,
        user_assessment: user_assessment,
        norm_id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337'
      )

      expect(user_assessment.norm_name).to eq('Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)')
    end

    it 'returns pearson_norm_name is assessment is pearson' do
      norms = {
        'items' =>
          [{
            'label' => 'pearson_norm_name',
            'normId' => 'pearson_norm_id'
          }]
      }
      assessment = build(:assessment, :pearson)
      user_assessment = build(:user_assessment, assessment: assessment)
      create(:pearson_assessment, product_id: assessment.external_assessment_id, norms: norms)
      build(
        :pearson_user_assessment,
        user_assessment: user_assessment,
        norm_id: 'pearson_norm_id'
      )

      expect(user_assessment.norm_name).to eq('pearson_norm_name')
    end

    it 'returns regular norm name using norm_id column' do
      norm = create(:norm)
      user_assessment = build(:user_assessment, norm: norm)

      expect(user_assessment.norm_name).to eq(norm.name)
    end
  end
end
