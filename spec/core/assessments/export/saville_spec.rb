# frozen_string_literal: true

require 'rails_helper'

describe Assessments::Export::Saville do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment, :saville) }
  let!(:user_assessment) { create(:user_assessment, assessment: assessment, campaign: campaign) }
  let(:file_name) { 'assessesment-external-result-export.xlsx' }
  before(:each) do
    factor1_id = 'factor_id_1'
    factor2_id = 'factor_id_2'
    factor1_name = 'factor1'
    factor2_name = 'factor2'
    @nipsitive_factor1 = create(:saville_factor, score_type: 'Nipsitive', factor_id: factor1_id,
      name: factor1_name, value_type: 'percentile', assessment_id: assessment.external_settings[:assessment_id])
    @nipsitive_factor2 = create(:saville_factor, score_type: 'Nipsitive', factor_id: factor1_id,
      name: factor1_name, value_type: 'sten', assessment_id: assessment.external_settings[:assessment_id])
    @ipsitive_factor1 = create(:saville_factor, score_type: 'Ipsitive', factor_id: factor1_id,
      name: factor1_name, value_type: 'percentile', assessment_id: assessment.external_settings[:assessment_id])
    @ipsitive_factor2 = create(:saville_factor, score_type: 'Ipsitive', factor_id: factor2_id,
     name: factor2_name, value_type: 'sten', assessment_id: assessment.external_settings[:assessment_id])
  end

  it 'export data for all saville factor' do
    xlsx = described_class.call!(assessment, campaign)
    xlsx.serialize(file_name)
    xlsx = Roo::Spreadsheet.open(file_name)

    expect(xlsx.sheets).to eq(%w[Nipsitive Ipsitive])
    verify_nipsitive_sheet(xlsx.sheet(0))
    verify_ipsitive_sheet(xlsx.sheet(1))
  end

  private

  def verify_nipsitive_sheet(sheet)
    expected_headers = ['Result ID', 'Full Name', 'Email', 'Status', 'Started at', 'Completed at',
                        @nipsitive_factor1.factor_id, @nipsitive_factor2.factor_id]
    result_header = sheet.row(1)
    expect(result_header).to eq(expected_headers)

    expected_sub_headers = [nil, nil, nil, nil, nil, nil, @nipsitive_factor1.name, @nipsitive_factor2.name]
    result_sub_headers = sheet.row(2)
    expect(result_sub_headers).to eq(expected_sub_headers)

    expected_value_type_headers = [nil, nil, nil, nil, nil, nil, @nipsitive_factor1.value_type,
                                   @nipsitive_factor2.value_type]
    result_value_type_header = sheet.row(3)
    expect(result_value_type_header).to eq(expected_value_type_headers)

    user_result = user_assessment.users_result
    expected_data_row = [
      user_result.encoded_id,
      "#{user_result.evaluator.first_name}, #{user_result.evaluator.last_name}",
      user_result.evaluator.email,
      I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
      user_assessment.started_at.try(:strftime, '%D %r'),
      user_result.completed_at.try(:strftime, '%D %r'),
      nil,
      nil
    ]
    result_data_row = sheet.row(4)
    expect(result_data_row).to eq(expected_data_row)
  end

  def verify_ipsitive_sheet(sheet)
    expected_headers = ['Result ID', 'Full Name', 'Email', 'Status', 'Started at', 'Completed at',
                        @ipsitive_factor1.factor_id, @ipsitive_factor2.factor_id]
    result_header = sheet.row(1)
    expect(result_header).to eq(expected_headers)

    expected_sub_headers = [nil, nil, nil, nil, nil, nil, @ipsitive_factor1.name, @ipsitive_factor2.name]
    result_sub_headers = sheet.row(2)
    expect(result_sub_headers).to eq(expected_sub_headers)

    expected_value_type_headers = [nil, nil, nil, nil, nil, nil, @ipsitive_factor1.value_type,
                                   @ipsitive_factor2.value_type]
    result_value_type_header = sheet.row(3)
    expect(result_value_type_header).to eq(expected_value_type_headers)

    user_result = user_assessment.users_result
    expected_data_row = [
      user_result.encoded_id,
      "#{user_result.evaluator.first_name}, #{user_result.evaluator.last_name}",
      user_result.evaluator.email,
      I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
      user_assessment.started_at.try(:strftime, '%D %r'),
      user_result.completed_at.try(:strftime, '%D %r'),
      nil,
      nil
    ]
    result_data_row = sheet.row(4)
    expect(result_data_row).to eq(expected_data_row)
  end
end
