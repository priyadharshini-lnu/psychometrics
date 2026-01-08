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
          :duration, :course_url, :course_start_date, :course_end_date, :type, :tags
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

    context 'with development_action_tags parameter' do
      let(:query_text) { 'leadership skills' }

      let!(:da_with_matching_tags) do
        da = create(:development_action, name: 'Guided Leadership', skills: [skill1])
        da.tag_list.add('guide', 'low')
        da.save!
        da
      end

      let!(:da_with_partial_match) do
        da = create(:development_action, name: 'Quick Leadership', skills: [skill1])
        da.tag_list.add('low')
        da.save!
        da
      end

      let!(:da_without_tags) do
        create(:development_action, name: 'Basic Leadership', skills: [skill1])
      end

      let!(:da_three_matches) do
        da = create(:development_action, name: 'Ultimate Guide Low', skills: [skill1])
        da.tag_list.add('guide', 'low', 'ultimate')
        da.save!
        da
      end

      let!(:da_another_no_match1) do
        create(:development_action, name: 'Advanced Leadership A', skills: [skill1])
      end

      let!(:da_another_no_match2) do
        create(:development_action, name: 'Advanced Leadership B', skills: [skill1])
      end

      let!(:da_another_no_match3) do
        create(:development_action, name: 'Advanced Leadership C', skills: [skill1])
      end

      before do
        stub_wisper_publisher('Skills::EmbeddingQuery', :call, :ok, [skill1])
      end

      it 'orders development actions by tag match count (highest first)' do
        result = subject.execute(query_text: query_text, development_action_tags: 'low, guide, ultimate')

        development_actions = result[:skills].first[:development_actions]
        action_names = development_actions.pluck(:name)

        matching_actions = ['Ultimate Guide Low', 'Guided Leadership', 'Quick Leadership']
        non_matching_actions = ['Basic Leadership', 'Advanced Leadership A', 'Advanced Leadership B',
                                'Advanced Leadership C', 'APPLY HIGH Tagged DA']

        matching_indices = matching_actions.filter_map { |name| action_names.index(name) }
        non_matching_indices = non_matching_actions.filter_map { |name| action_names.index(name) }

        expect(matching_indices.max).to be < non_matching_indices.min

        expect(action_names.index('Ultimate Guide Low')).to be < action_names.index('Guided Leadership')
        expect(action_names.index('Guided Leadership')).to be < action_names.index('Quick Leadership')
      end

      it 'includes non-matching development actions after matching ones' do
        result = subject.execute(query_text: query_text, development_action_tags: 'guide')

        development_actions = result[:skills].first[:development_actions]
        action_names = development_actions.pluck(:name)

        expect(action_names).to include('Basic Leadership')
        expect(action_names.index('Guided Leadership')).to be < action_names.index('Basic Leadership')
      end

      it 'returns all development actions when development_action_tags is nil' do
        result = subject.execute(query_text: query_text, development_action_tags: nil)

        development_actions = result[:skills].first[:development_actions]
        expect(development_actions.size).to be >= 3
      end
    end
  end
end
