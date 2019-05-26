# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Reports::ReleaseConditionResolver do
  let(:current_user) { create(:user, email: 'a@a.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:option) { create(:threesixty_option, threesixty_campaign: campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign, user: current_user) }
  let(:manager) { create(:relationship, name: 'Manager') }
  let(:peer) { create(:relationship, name: 'Peer') }

  let(:evaluator_1) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator_2) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator_3) { create(:threesixty_evaluator, campaign: campaign.campaign) }

  describe '.call with multi AND conditions' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer)

      option.reports = {
        "availability" => {
          "conditions"=>
            [
              {
                "operator"=>"if",
                "conditions"=> [
                  {"type"=>"evaluations", "operator"=>"if", "relationship"=>"Manager", "number_of_evaluator"=>"1"},
                  {"type"=>"evaluations", "operator"=>"and", "relationship"=>"Peer", "number_of_evaluator"=>"2"}
                ]
              }
            ],
        }
      }
    end

    it do
      expect(described_class.call!(campaign, subject)).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, peer)
      expect(described_class.call!(campaign, subject)).to be true
    end
  end

  describe '.call with multi OR conditions' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer, :waiting)

      option.reports = {
        "availability" => {
          "conditions"=>
            [
              {
                "operator"=>"if",
                "conditions"=> [
                  {"type"=>"evaluations", "operator"=>"if", "relationship"=>"Manager", "number_of_evaluator"=>"2"},
                  {"type"=>"evaluations", "operator"=>"or", "relationship"=>"Peer", "number_of_evaluator"=>"2"}
                ]
              }
            ],
        }
      }
    end

    it do
      expect(described_class.call!(campaign, subject)).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_2, peer)
      expect(described_class.call!(campaign, subject)).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_2, peer)
      create_participant(campaign, subject, evaluator_3, peer)
      expect(described_class.call!(campaign, subject)).to be true
    end
  end

  describe '.call with single condition' do
    before do
      campaign.option = option
      create_participant(campaign, subject, evaluator_1, manager)
      create_participant(campaign, subject, evaluator_2, peer)

      option.reports = {
        "availability" => {
          "conditions"=>
            [
              {
                "operator"=>"if",
                "conditions"=> [
                  {"type"=>"evaluations", "operator"=>"if", "relationship"=>"Manager", "number_of_evaluator"=>"2"},
                ]
              }
            ],
        }
      }
    end

    it do
      expect(described_class.call!(campaign, subject)).to be false
    end

    it do
      create_participant(campaign, subject, evaluator_3, manager)
      expect(described_class.call!(campaign, subject)).to be true
    end
  end

  def create_participant(threesixty_campaign, subject, evaluator, relation, status = :completed)
    create(:participant,
      campaign: threesixty_campaign.campaign,
      subject: subject.user,
      evaluator: evaluator.user,
      relationship: relation,
      evaluator_nomination_status: status
    )
  end

  describe '.check_results' do
    let(:resolver) { described_class.new(campaign, subject) }

    it do
      results = [{type: 'if', result: true}]
      expect(resolver.check_results(results)).to be true
    end

    it do
      results = [{type: 'if', result: true}, {type: 'or', result: false}, {type: 'or', result: true},  ]
      expect(resolver.check_results(results)).to be true
    end

    it do
      results = [{type: 'if', result: true}, {type: 'and', result: false}]
      expect(resolver.check_results(results)).to be false
    end

    it do
      results = [{type: 'if', result: true}, {type: 'and', result: true}]
      expect(resolver.check_results(results)).to be true
    end
    it do
      results = [{type: 'if', result: false}, {type: 'or', result: true}, {type: 'and', result: false},]
      expect(resolver.check_results(results)).to be false
    end
  end
end
