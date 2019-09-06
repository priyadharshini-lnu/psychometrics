# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::BySubjectDatasheetFields do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_evaluators) { create_list(:threesixty_evaluator, 3) }
  let(:threesixty_subjects) { create_list(:threesixty_evaluator, 3) }
  let(:datasheet) { create(:datasheet, project: threesixty_campaign.project) }

  it 'returns evaluators who have subject with matching datasheet criteria' do
    3.times do |index|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subjects[index].user_id,
        evaluator_id: threesixty_evaluators[index].user_id
      )
    end

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
      data: { 'gender' => 'M' }
    )
    create(
      :datasheet_row,
      datasheet: datasheet,
      email: threesixty_subjects[2].email,
      data: { 'gender' => 'F' }
    )

    criteria_list = [{ 'field' => 'subject_datasheet', 'sub_field' => 'gender', 'value' => 'M' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_evaluators,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_evaluators[0..1])
  end
end
