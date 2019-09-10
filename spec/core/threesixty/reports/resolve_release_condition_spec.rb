# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Reports::ResolveReleaseCondition do
  let(:current_user) { create(:user, email: 'a@a.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:option) { create(:threesixty_option, threesixty_campaign: campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign, user: current_user) }
  let(:manager) { create(:relationship, name: 'Manager', type: :global) }
  let(:peer) { create(:relationship, name: 'Peer') }

  let(:evaluator_1) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator_2) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator_3) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator_4) { create(:threesixty_evaluator, campaign: campaign.campaign) }

  describe '.call with multi AND conditions' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer)

      option.reports = {
        'availability' => {
          'conditions' => []
        }
      }
    end

    it do
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be true
    end
  end

  describe '.call with multi AND conditions' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer)

      option.reports = {
        'availability' => {
          'conditions' => [
            {
              'operator' => 'if',
              'conditions' => [
                { 'type' => 'evaluations',
                  'operator' => 'if', 'relationship' => manager.id, 'number_of_evaluator' => '1' },
                { 'type' => 'evaluations',
                  'operator' => 'and', 'relationship' => peer.id, 'number_of_evaluator' => '2' }
              ]
            },
            {
              'operator' => 'and',
              'conditions' => [
                { 'type' => 'evaluations',
                  'operator' => 'if', 'relationship' => manager.id, 'number_of_evaluator' => '2' },
                { 'type' => 'evaluations',
                  'operator' => 'or', 'relationship' => peer.id, 'number_of_evaluator' => '3' }
              ]
            }
          ]
        }
      }
    end

    it do
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, peer)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, peer)
      create_participant(campaign, subject, evaluator_4, peer)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be true
    end
  end

  describe '.call with multi OR conditions' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer, :waiting)

      option.reports = {
        'availability' => {
          'conditions' => [
            {
              'operator' => 'if',
              'conditions' => [
                { 'type' => 'evaluations', 'operator' => 'if',
                  'relationship' => manager.id, 'number_of_evaluator' => '2' },
                { 'type' => 'evaluations', 'operator' => 'and',
                  'relationship' => peer.id, 'number_of_evaluator' => '2' }
              ]
            }
          ]
        }
      }
    end

    it do
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, peer)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, manager)
      create_participant(campaign, subject, evaluator_4, peer)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be true
    end
  end

  describe '.call with single condition' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)

      option.reports = {
        'availability' => {
          'conditions' =>
            [
              {
                'operator' => 'if',
                'conditions' => [
                  { 'type' => 'evaluations',
                    'operator' => 'if', 'relationship' => manager.id, 'number_of_evaluator' => '2' },
                  { 'type' => 'evaluations',
                    'operator' => 'and', 'relationship' => peer.id, 'number_of_evaluator' => '1' }
                ]
              }
            ]
        }
      }
    end

    it do
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_2, manager)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_2, manager)
      create_participant(campaign, subject, evaluator_3, peer)
      @counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!([subject.user_id], campaign, [:completed])
      expect(described_class.call!(subject, campaign.option, @counters[subject.user_id][:completed])).to be true
    end
  end

  def create_participant(threesixty_campaign, subject, evaluator, relation, status = :completed)
    create(:threesixty_participant,
           campaign: threesixty_campaign.campaign,
           subject: subject.user,
           evaluator: evaluator.user,
           relationship: relation,
           evaluator_nomination_status: status,
           manager_evaluation_status: :approved)
    create(:users_result, campaign: threesixty_campaign.campaign,
           evaluator: evaluator.user, status: :completed, subject: subject.user)
  end
end
