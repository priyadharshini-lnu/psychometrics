# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::Filter do
  let!(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }

  context 'multiple subject criteria' do
    before do
      @threesixty_subjects = []
      3.times do
        @threesixty_subjects << create(
          :threesixty_subject,
          campaign: threesixty_campaign.campaign,
          user: create(:user, first_name: "James")
        )
      end
    end

    it do
      manager_relationship = create(:relationship, name: 'Manager')
      @threesixty_subjects[0..1].each do |threesixty_subject|
        create(
          :participant,
          campaign_id: threesixty_campaign.campaign_id,
          relationship: manager_relationship,
          subject: threesixty_subject.user
        )
      end

      criteria_list = [
        { 'field' => 'first_name', 'comparator' => 'equal', 'value' => 'James' },
        { 'field' => 'relationship', 'value' => manager_relationship.id }
      ]

      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatable_types: :subject,
        criteria_list: criteria_list
      )

      expect(results).to match_array(@threesixty_subjects[0..1])
    end
  end

  context 'multiple evaluator criteria' do
    before do
      @threesixty_evaluators = []
      3.times do
        @threesixty_evaluators << create(
          :threesixty_evaluator,
          campaign: threesixty_campaign.campaign,
          user: create(:user, first_name: "James")
        )
      end
    end

    it do
      manager_relationship = create(:relationship, name: 'Manager')
      @threesixty_evaluators[0..1].each do |threesixty_evaluator|
        create(
          :participant,
          campaign_id: threesixty_campaign.campaign_id,
          relationship: manager_relationship,
          evaluator: threesixty_evaluator.user
        )
      end

      criteria_list = [
        { 'field' => 'first_name', 'comparator' => 'equal', 'value' => 'James' },
        { 'field' => 'relationship', 'value' => manager_relationship.id }
      ]

      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatable_types: :evaluator,
        criteria_list: criteria_list
      )

      expect(results).to match_array(@threesixty_evaluators[0..1])
    end
  end
end
