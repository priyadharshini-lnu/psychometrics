# frozen_string_literal: true

require 'rails_helper'

describe Idp::GetSkillGapReportData do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:idp_template) { create(:idp_template) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  let!(:factor) { create(:factor) }
  let!(:assessment) { create(:assessment, dimension: factor.dimension) }
  let!(:campaign_factor) { create(:campaign_factor, code: 'code', campaign: campaign) }
  let!(:campaign_factor_value) do
    create(:campaign_factor_value, campaign_factor: campaign_factor,
                                        campaign: campaign, user: user, value: 2.3)
  end
  let!(:datasheet) { create(:datasheet, campaign: campaign, columns: [name: 'Job Title']) }
  let!(:col) { create(:sheet_column, sheet: datasheet, name: 'Job Title', column_type: 'string') }
  let!(:idp_template_skill) { create(:idp_template_skill, campaign_factor_code: 'code', idp_template: idp_template) }
  let!(:idp_template_skill2) do
    create(:idp_template_skill, scoring_source: :assessment, idp_template: idp_template, assessment_id: assessment.id,
           factor_id: factor.id, assessment_score_type: 'score')
  end
  let!(:assessment) { create(:assessment, dimension: factor.dimension) }
  let!(:user_assessment) do
    create(:user_assessment, evaluator: user, subject: user, assessment: assessment,
                                  campaign: campaign, status: :completed)
  end

  it 'returns skill gap data' do
    r1 = create(:sheet_row, email: user.email, sheet: datasheet)
    create(:sheet_row_datum, sheet_row: r1, sheet_column: col, string_value: 'Developer')
    user_assessment.result.update(scoring: { factor.id.to_s => { 'score' => 2 } })
    skill_gap = described_class.call!(user)

    expect(skill_gap.dig('idp_template_skills', 0, 'score')).to eq(2.3)
    expect(skill_gap.dig('idp_template_skills', 1, 'score')).to eq(2)
    expect(skill_gap['datasheet_fields']).to eq([{ 'field' => 'Job Title', 'value' => 'Developer' }])
    expect(skill_gap['profile_fields']).to eq([
      { 'field' => 'first_name', 'value' => user.first_name },
      { 'field' => 'last_name', 'value' => user.last_name }
    ])
  end
end
