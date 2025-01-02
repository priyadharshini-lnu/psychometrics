# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByDatasheetFields do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 2) }
  let(:datasheet) { create(:datasheet, project: threesixty_campaign.project) }
  let!(:columns) do
    [
      create(:sheet_column, sheet: datasheet, name: 'gender'),
      create(:sheet_column, sheet: datasheet, name: 'role')
    ]
  end

  it 'returns subject matching datasheet criteria' do
    r1 = create(
      :sheet_row,
      sheet: datasheet,
      email: threesixty_subjects[0].email
    )
    r2 = create(
      :sheet_row,
      sheet: datasheet,
      email: threesixty_subjects[1].email
    )
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: 'M')
    create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], string_value: 'F')

    criteria_list = [{ 'field' => 'datasheet', 'sub_field' => 'gender', 'value' => 'M' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array([threesixty_subjects[0]])
  end

  it 'works with multiple datasheet criteria' do
    r1 = create(
      :sheet_row,
      sheet: datasheet,
      email: threesixty_subjects[0].email
    )
    r2 = create(
      :sheet_row,
      sheet: datasheet,
      email: threesixty_subjects[1].email
    )
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: 'M')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: 'QA')
    create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], string_value: 'M')
    create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], string_value: 'Developer')

    criteria_list = [
      { 'field' => 'datasheet', 'sub_field' => 'gender', 'value' => 'M' },
      { 'field' => 'datasheet', 'sub_field' => 'role', 'value' => 'qa' }
    ]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects)
  end
end
