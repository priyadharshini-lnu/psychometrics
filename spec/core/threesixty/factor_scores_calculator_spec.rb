# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Threesixty::FactorScoresCalculator do
  describe '.call!' do
    let!(:project) { create(:project) }
    let!(:user) { create(:user, project: project) }
    let!(:campaign) { create(:campaign, :threesixty, project: project) }
    let!(:dimension) { create(:dimension) }
    let!(:assessment) { create(:assessment, dimension: dimension) }
    let!(:threesixty_campaign) { create(:threesixty_campaign, assessment: assessment, campaign: campaign) }

    let!(:self_relationship) { create(:relationship, name: 'Self', campaign: campaign) }
    let!(:peer_relationship) { create(:relationship, name: 'Peer', campaign: campaign) }

    let!(:factor1) { create(:factor, name: 'Leadership', description: 'Leadership skills', dimension: dimension) }
    let!(:factor2) { create(:factor, name: 'Communication', description: 'Communication skills', dimension: dimension) }

    let!(:factor1_benchmark) do
      create(:factor_benchmark_score,
             campaign: campaign,
             assessment_id: assessment.id,
             factor: factor1,
             benchmark_score: 3.0)
    end

    let!(:factor2_benchmark) do
      create(:factor_benchmark_score,
             campaign: campaign,
             assessment_id: assessment.id,
             factor: factor2,
             benchmark_score: 3.5)
    end

    let!(:self_assessment) do
      create(:user_assessment,
             evaluator: user,
             subject: user,
             campaign: campaign,
             relationship: self_relationship,
             status: 'completed').tap do |assessment|
        assessment.users_result.update!(scoring: {
          factor1.id.to_s => { 'score' => 4.0 },
          factor2.id.to_s => { 'score' => 4.5 }
        })
      end
    end

    let!(:peer_assessment1) do
      create(:user_assessment,
             evaluator: create(:user, project: project),
             subject: user,
             campaign: campaign,
             relationship: peer_relationship,
             status: 'completed').tap do |assessment|
        assessment.users_result.update!(scoring: {
          factor1.id.to_s => { 'score' => 3.0 },
          factor2.id.to_s => { 'score' => 3.5 }
        })
      end
    end

    let!(:peer_assessment2) do
      create(:user_assessment,
             evaluator: create(:user, project: project),
             subject: user,
             campaign: campaign,
             relationship: peer_relationship,
             status: 'completed').tap do |assessment|
        assessment.users_result.update!(scoring: {
          factor1.id.to_s => { 'score' => 3.5 },
          factor2.id.to_s => { 'score' => 4.0 }
        })
      end
    end

    it 'returns correctly calculated scores' do
      results = described_class.call!(user, campaign)[:results]

      expect(results.size).to eq(2)

      leadership = results.find { |r| r[:competency] == 'Leadership' }
      expect(leadership[:description]).to eq('Leadership skills')

      scores = leadership[:scores]
      self_score = scores.find { |s| s[:relationship] == 'Self' }
      peer_score = scores.find { |s| s[:relationship] == 'Peer' }
      others_score = scores.find { |s| s[:relationship] == 'Others' }

      expect(self_score[:score]).to eq(4.0)
      expect(self_score[:gap]).to eq(0.0)
      expect(self_score[:benchmark]).to eq(3.0)
      expect(self_score[:benchmark_gap]).to eq(-1.0)

      expect(peer_score[:score]).to eq(3.25)  # (3.0 + 3.5) / 2
      expect(peer_score[:gap]).to eq(0.75)    # 4.0 - 3.25
      expect(peer_score[:benchmark_gap]).to eq(-0.25) # 3.0 - 3.25

      expect(others_score[:score]).to eq(3.25)
      expect(others_score[:gap]).to eq(0.75)
      expect(others_score[:benchmark_gap]).to eq(-0.25)

      communication = results.find { |r| r[:competency] == 'Communication' }
      expect(communication[:description]).to eq('Communication skills')

      communication_scores = communication[:scores]
      communication_self_score = communication_scores.find { |s| s[:relationship] == 'Self' }
      communication_peer_score = communication_scores.find { |s| s[:relationship] == 'Peer' }
      communication_others_score = communication_scores.find { |s| s[:relationship] == 'Others' }

      expect(communication_self_score[:score]).to eq(4.5)
      expect(communication_self_score[:gap]).to eq(0.0)
      expect(communication_self_score[:benchmark]).to eq(3.5)
      expect(communication_self_score[:benchmark_gap]).to eq(-1.0)

      expect(communication_peer_score[:score]).to eq(3.75) # Average of 3.5 and 4.0
      expect(communication_peer_score[:gap]).to eq(0.75) # 4.5 - 3.75 (self - relationship_scorw)
      expect(communication_peer_score[:benchmark_gap]).to eq(-0.25) # 3.5 - 3.75 (benchmark - relationship_score)

      expect(communication_others_score[:score]).to eq(3.75)
      expect(communication_others_score[:gap]).to eq(0.75)
      expect(communication_others_score[:benchmark_gap]).to eq(-0.25)
    end
  end
end
