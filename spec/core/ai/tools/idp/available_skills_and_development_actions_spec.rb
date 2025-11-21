# frozen_string_literal: true

require 'rails_helper'

describe AI::Tools::Idp::AvailableSkillsAndDevelopmentActions do
  subject { described_class.new(user_idp_plan) }

  let(:user) { create(:user) }
  let!(:client) { create(:tenancy) }
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let!(:skill_settings) do
    { 'technical_client' => 'none', 'technical_global' => 'all',
      'behavioral_client' => 'none', 'behavioral_global' => 'all' }
  end
  let(:idp_template) { create(:idp_template, :published, project: project, skill_settings: skill_settings) }
  let(:user_idp_plan) { create(:user_idp_plan, campaign: campaign, user: user, idp_template: idp_template) }
  let!(:campaign_user) { create(:campaign_user, campaign:, user:) }

  let!(:skill1) { create(:skill, name: 'Leadership', skill_type: 'behavioral', project: nil) }
  let!(:skill2) { create(:skill, name: 'Communication', skill_type: 'behavioral', project: nil) }
  let!(:development_action1) { create(:development_action, name: 'Leadership Workshop', skills: [skill1]) }
  let!(:development_action2) { create(:development_action, name: 'Communication Training', skills: [skill2]) }

  describe '#execute' do
    context 'with valid query_text parameter' do
      let(:query_text) { 'leadership and communication skills for management role' }
      let(:expected_skills) { [skill1, skill2] }

      before do
        stub_wisper_publisher('Skills::EmbeddingQuery', :call, :ok, expected_skills)
      end

      it 'returns skills with development actions based on semantic similarity' do
        result = subject.execute(query_text: query_text, limit: 10)

        expect(result).to be_a(Hash)
        expect(result).to have_key(:skills)
        expect(result).to have_key(:meta)
        expect(result[:skills]).to be_an(Array)
        expect(result[:meta]).to be_a(Hash)

        skill_result = result[:skills].first
        expect(skill_result).to include(:id, :name, :description, :skill_type, :development_actions)

        development_action = skill_result[:development_actions].first
        expect(development_action).to include(
          :id, :name, :description, :learning_style, :development_action_type,
          :duration, :course_url, :course_start_date, :course_end_date, :type
        )

        expect(result[:meta]).to include(:result_count, :query_result_by_type, :total_available_skills)
      end

      it 'limits results based on limit parameter' do
        limited_skills = [skill1]
        stub_wisper_publisher('Skills::EmbeddingQuery', :call, :ok, limited_skills)

        result = subject.execute(query_text: query_text, limit: 1)

        expect(result[:skills].size).to eq(1)
        expect(result[:meta][:result_count]).to eq(1)
      end

      it 'groups skills by type in meta information' do
        result = subject.execute(query_text: query_text, limit: 10)

        expect(result[:meta][:query_result_by_type]).to be_a(Hash)
        expect(result[:meta][:query_result_by_type]).to have_key('behavioral')
      end
    end

    context 'when embedding query returns an error' do
      let(:error_message) { 'Embedding query failed' }

      before do
        stub_wisper_publisher('Skills::EmbeddingQuery', :call, :error, error_message)
      end

      it 'returns error message' do
        result = subject.execute(query_text: 'test query', limit: 10)

        expect(result).to have_key(:error)
        expect(result[:error]).to eq(error_message)
      end
    end
  end
end
