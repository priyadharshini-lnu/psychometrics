# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByNominationRequirement do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3) }

  context 'completed criteria' do
    it 'returns subjects with nomination completed criteria' do
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[0].user).and_return(true)
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[1].user).and_return(true)
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[2].user).and_return(false)

      criteria_list = [{ 'field' => 'nomination_requirement', 'value' => 'completed' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participators: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[0..1])
    end
  end

  context 'not_completed criteria' do
    it 'returns subjects with nomination not completed criteria' do
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[0].user).and_return(true)
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[1].user).and_return(false)
      allow(Threesixty::Subjects::IsNominationRequirementComplete).to receive(:call!).
        with(threesixty_campaign, threesixty_subjects[2].user).and_return(false)

      criteria_list = [{ 'field' => 'nomination_requirement', 'value' => 'not_completed' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participators: threesixty_subjects,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_subjects[1..2])
    end
  end
end
