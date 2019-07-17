# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::ByDatasheetFields do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 2) }
  let(:datasheet) { create(:datasheet, project: threesixty_campaign.project) }

  it 'returns subject matching datasheet criteria' do
    create(
      :datasheet_row,
      datasheet: datasheet,
      email: threesixty_subjects[0].email,
      data: { 'gender' => 'M' }
    )
    create(
      :datasheet_row,
      datasheet: datasheet,
      email: threesixty_subjects[1].email,
      data: { 'gender' => 'F' }
    )

    criteria_list = [{ 'field' => 'datasheet', 'sub_field' => 'gender', 'value' => 'M' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array([threesixty_subjects[0]])
  end

  it 'works with multiple datasheet criteria' do
    create(
      :datasheet_row,
      datasheet: datasheet,
      email: threesixty_subjects[0].email,
      data: { 'gender' => 'M', 'role' => 'QA' }
    )
    create(
      :datasheet_row,
      datasheet: datasheet,
      email: threesixty_subjects[1].email,
      data: { 'gender' => 'M', 'role' => 'Developer' }
    )

    criteria_list = [
      { 'field' => 'datasheet', 'sub_field' => 'gender', 'value' => 'M' },
      { 'field' => 'datasheet', 'sub_field' => 'role', 'value' => 'qa' },
    ]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array([threesixty_subjects[0]])
  end
end
