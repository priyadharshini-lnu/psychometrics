# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::CompactCompletionStatusQuery do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user, email: 'andrew@email.com', first_name: 'Andrew', last_name: 'Wok') }
  let!(:user_one) { create(:user, email: 'james@email.com', first_name: 'James', last_name: 'Bond') }
  let!(:user_two) { create(:user, email: 'bob@email.com', first_name: 'Bob', last_name: 'Jobs') }
  let!(:assessment) { create(:assessment, name: 'Assessment') }
  let!(:minor_assessment) { create(:assessment, name: 'Minor Assessment') }
  let!(:super_assessment) { create(:assessment, name: 'Super Assessment') }

  context 'with subject and evaluator same for user_assessment within campaign' do
    let!(:user_assessment) do
      create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign,
        assessment: minor_assessment, status: 'interrupted'
      )
    end
    let!(:user_one_user_assessment) do
      create(
        :user_assessment, subject: user_one, evaluator: user_one, campaign: campaign,
        assessment: assessment, status: 'completed'
      )
    end
    let!(:user_two_user_assessment) do
      create(
        :user_assessment, subject: user_two, evaluator: user_two, campaign: campaign,
        assessment: super_assessment, status: 'timed_out'
      )
    end

    it do
      result = described_class.new(campaign.id).query.to_a
      expect(result.size).to eq 3
      expect(result).to eq [
        {
          'Email' => 'andrew@email.com',
          'First Name' => 'Andrew',
          'Last Name' => 'Wok',
          'Assessment' => nil,
          'Minor Assessment' => 'Interrupted',
          'Super Assessment' => nil
        },
        {
          'Email' => 'bob@email.com',
          'First Name' => 'Bob',
          'Last Name' => 'Jobs',
          'Assessment' => nil,
          'Minor Assessment' => nil,
          'Super Assessment' => 'Timed Out'
        },
        {
          'Email' => 'james@email.com',
          'First Name' => 'James',
          'Last Name' => 'Bond',
          'Assessment' => 'Completed',
          'Minor Assessment' => nil,
          'Super Assessment' => nil
        }
      ]
    end
  end

  context 'with subject and evaluator not same for any user_assessment within campaign' do
    let!(:user_assessment_one) { create(:user_assessment, subject: user, campaign: campaign) }
    let!(:user_one_user_assessment_one) { create(:user_assessment, subject: user_one, campaign: campaign) }
    it do
      result = described_class.new(campaign.id).query.to_a
      expect(result.size).to eq 0
    end
  end

  context 'with same assessment added for both users' do
    let!(:user_assessment) do
      create(
        :user_assessment, assessment: assessment, subject: user, evaluator: user,
        campaign: campaign, status: 'in_progress'
      )
    end
    let!(:user_one_user_assessment) do
      create(
        :user_assessment, assessment: assessment, subject: user_one, evaluator: user_one,
        campaign: campaign, status: 'ineligible'
      )
    end

    it do
      result = described_class.new(campaign.id).query.to_a
      expect(result.size).to eq 2
      expect(result).to match_array [
        {
          'Email' => 'andrew@email.com',
          'First Name' => 'Andrew',
          'Last Name' => 'Wok',
          'Assessment' => 'In Progress'
        },
        {
          'Email' => 'james@email.com',
          'First Name' => 'James',
          'Last Name' => 'Bond',
          'Assessment' => 'Ineligible'
        }
      ]
    end
  end

  context 'for 2 users with 1 same assessment and 1 diffrent for both' do
    let!(:user_assessment) do
      create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign,
        assessment: assessment, status: 'interrupted'
      )
    end
    let!(:user_assessment_one) do
      create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign,
        assessment: super_assessment, status: 'not_started'
      )
    end
    let!(:user_one_user_assessment) do
      create(
        :user_assessment, subject: user_one, evaluator: user_one, campaign: campaign,
        assessment: assessment, status: 'in_progress'
      )
    end
    let!(:user_one_user_assessment_one) do
      create(
        :user_assessment, subject: user_one, evaluator: user_one, campaign: campaign,
        assessment: minor_assessment, status: 'completed'
      )
    end

    it do
      result = described_class.new(campaign.id).query.to_a
      expect(result.size).to eq 2
      expect(result).to match_array [
        {
          'Email' => 'andrew@email.com',
          'First Name' => 'Andrew',
          'Last Name' => 'Wok',
          'Assessment' => 'Interrupted',
          'Minor Assessment' => nil,
          'Super Assessment' => 'Not Started'
        },
        {
          'Email' => 'james@email.com',
          'First Name' => 'James',
          'Last Name' => 'Bond',
          'Assessment' => 'In Progress',
          'Minor Assessment' => 'Completed',
          'Super Assessment' => nil
        }
      ]
    end
  end

  context 'pagination' do
    let!(:user_assessment) do
      create(
        :user_assessment, subject: user, evaluator: user, campaign: campaign,
        assessment: minor_assessment, status: 'interrupted'
      )
    end
    let!(:user_one_user_assessment) do
      create(
        :user_assessment, subject: user_one, evaluator: user_one, campaign: campaign,
        assessment: assessment, status: 'completed'
      )
    end
    let!(:user_two_user_assessment) do
      create(
        :user_assessment, subject: user_two, evaluator: user_two, campaign: campaign,
        assessment: super_assessment, status: 'timed_out'
      )
    end

    it 'accepts limit and offset' do
      result = described_class.new(campaign.id, limit: 1, offset: 1).query.to_a
      expect(result.size).to eq 1
      expect(result).to eq [
        {
          'Email' => 'bob@email.com',
          'First Name' => 'Bob',
          'Last Name' => 'Jobs',
          'Assessment' => nil,
          'Minor Assessment' => nil,
          'Super Assessment' => 'Timed Out'
        }
      ]
    end
  end
end
