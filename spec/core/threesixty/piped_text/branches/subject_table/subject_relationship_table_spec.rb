# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::SubjectTable::SubjectRelationshipTable do
  describe '.call' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:subjects) { create_list(:user, 2) }
    let(:evaluator) { create(:user) }

    it 'returns hedaer for subject relationship table' do
      result = described_class.call!([], nil, threesixty_campaign: threesixty_campaign, evaluator: evaluator)
      html_result = Nokogiri::HTML(result)
      expected_headers = ['Subject Name', 'Subject Email', 'Subject Relationship']
      actual_headers = html_result.css('thead th').map(&:text)

      expect(expected_headers).to eq(actual_headers)
    end

    it 'returns multiple subject as table row' do
      participant1 = create(:threesixty_participant, :with_relationship, campaign_id: threesixty_campaign.campaign_id,
        subject_id: subjects[0].id, evaluator_id: evaluator.id)
      participant2 = create(:threesixty_participant, :with_relationship, campaign_id: threesixty_campaign.campaign_id,
        subject_id: subjects[1].id, evaluator_id: evaluator.id)

      result = described_class.call!([], nil, threesixty_campaign: threesixty_campaign, evaluator: evaluator,
        subject_ids: subjects.map(&:id))
      html_result = Nokogiri::HTML(result)

      expected_row1 = [subjects[0].decorate.full_name, subjects[0].email, participant1.relationship.name]
      actual_row1 = html_result.css('tbody tr:nth-child(1) td').map(&:text)
      expect(expected_row1).to eq(actual_row1)

      expected_row2 = [subjects[1].decorate.full_name, subjects[1].email, participant2.relationship.name]
      actual_row2 = html_result.css('tbody tr:nth-child(2) td').map(&:text)
      expect(expected_row2).to eq(actual_row2)
    end
  end
end
