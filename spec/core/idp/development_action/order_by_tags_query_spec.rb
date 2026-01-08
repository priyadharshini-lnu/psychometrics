# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::OrderByTagsQuery do
  let(:skill) { create(:skill) }
  let(:base_relation) { skill.development_actions }

  describe '#query' do
    context 'when tags are empty' do
      let(:tags) { [] }
      let(:limit) { 3 }

      let!(:da1) { create(:development_action, name: 'Action 1', skills: [skill]) }
      let!(:da2) { create(:development_action, name: 'Action 2', skills: [skill]) }
      let!(:da3) { create(:development_action, name: 'Action 3', skills: [skill]) }
      let!(:da4) { create(:development_action, name: 'Action 4', skills: [skill]) }

      it 'returns base relation with limit applied' do
        result = described_class.new(base_relation, tags, limit: limit).query

        expect(result.count).to eq(3)
        expect(result).to be_a(ActiveRecord::Relation)
      end
    end

    context 'when tags are provided' do
      let(:tags) { %w[guide low ultimate] }
      let(:limit) { 10 }

      # Actions with different tag match counts
      let!(:da_three_matches) do
        da = create(:development_action, name: 'Ultimate Guide Low', skills: [skill])
        da.tag_list.add('guide', 'low', 'ultimate')
        da.save!
        da
      end

      let!(:da_two_matches) do
        da = create(:development_action, name: 'Guided Leadership', skills: [skill])
        da.tag_list.add('guide', 'low')
        da.save!
        da
      end

      let!(:da_one_match) do
        da = create(:development_action, name: 'Quick Leadership', skills: [skill])
        da.tag_list.add('low')
        da.save!
        da
      end

      let!(:da_no_match1) do
        da = create(:development_action, name: 'APPLY HIGH Tagged DA', skills: [skill])
        da.tag_list.add('apply', 'high')
        da.save!
        da
      end

      let!(:da_no_match2) do
        create(:development_action, name: 'Basic Leadership', skills: [skill])
      end

      let!(:da_no_match3) do
        create(:development_action, name: 'Advanced Leadership A', skills: [skill])
      end

      let!(:da_no_match4) do
        create(:development_action, name: 'Advanced Leadership B', skills: [skill])
      end

      it 'orders actions by tag match count (highest first), then non-matching actions' do
        result = described_class.new(base_relation, tags, limit: limit).query
        action_names = result.map(&:name)

        expect(action_names[0]).to eq('Ultimate Guide Low')
        expect(action_names[1]).to eq('Guided Leadership')
        expect(action_names[2]).to eq('Quick Leadership')

        non_matching_actions = ['APPLY HIGH Tagged DA', 'Basic Leadership', 'Advanced Leadership A',
                                'Advanced Leadership B']
        non_matching_positions = non_matching_actions.filter_map { |name| action_names.index(name) }

        expect(non_matching_positions.min).to be >= 3
      end

      it 'respects the limit parameter' do
        result = described_class.new(base_relation, tags, limit: 3).query

        expect(result.count).to eq(3)
        action_names = result.pluck(:name)

        expect(action_names).to include('Ultimate Guide Low', 'Guided Leadership', 'Quick Leadership')
      end
    end
  end
end
