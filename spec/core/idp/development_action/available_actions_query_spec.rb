# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::AvailableActionsQuery do
  let(:campaign) { create(:campaign, status: :active) }
  let(:user) { create(:user, project: campaign.project) }
  let(:idp_template) { create(:idp_template, project: campaign.project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user, level: 'guide') }
  let!(:user_idp_plan) { create(:user_idp_plan, idp_template: idp_template, campaign: campaign, user: user) }

  describe '#query' do
    context 'when skill is technical' do
      let(:skill) { create(:skill, project: nil, skill_type: 'technical') }
      let!(:da1) { create(:development_action, name: 'Technical Action 1', skills: [skill]) }
      let!(:da2) { create(:development_action, name: 'Technical Action 2', skills: [skill]) }

      before do
        da1.tag_list.add('guide', 'shape')
        da1.save!
        da2.tag_list.add('apply')
        da2.save!
      end

      it 'returns all development actions without filtering by level' do
        result = described_class.new(skill, user_idp_plan).query
        action_names = result.pluck(:name)

        expect(action_names).to include('Technical Action 1', 'Technical Action 2')
        expect(result.count).to eq(2)
      end
    end

    context 'when skill is behavioral' do
      let(:skill) { create(:skill, project: nil, skill_type: 'behavioral') }
      let!(:da_guide) do
        da = create(:development_action, name: 'Guide Leadership', skills: [skill])
        da.tag_list.add('guide')
        da.save!
        da
      end

      let!(:da_apply) do
        da = create(:development_action, name: 'Apply Communication', skills: [skill])
        da.tag_list.add('apply')
        da.save!
        da
      end

      let!(:da_shape) do
        da = create(:development_action, name: 'Shape Mentoring', skills: [skill])
        da.tag_list.add('shape')
        da.save!
        da
      end

      let!(:da_no_tags) do
        create(:development_action, name: 'General Action', skills: [skill])
      end

      it 'returns only development actions tagged with user level' do
        result = described_class.new(skill, user_idp_plan).query
        action_names = result.pluck(:name)

        expect(action_names).to include('Guide Leadership')
        expect(action_names).not_to include('Apply Communication', 'Shape Mentoring', 'General Action')
        expect(result.count).to eq(1)
      end

      context 'when user level is case-insensitive match' do
        let!(:da_uppercase_tag) do
          da = create(:development_action, name: 'GUIDE Uppercase Tag', skills: [skill])
          da.tag_list.add('GUIDE')
          da.save!
          da
        end

        let!(:da_mixed_case_tag) do
          da = create(:development_action, name: 'Guide Mixed Case', skills: [skill])
          da.tag_list.add('Guide')
          da.save!
          da
        end

        before do
          campaign_user.update!(level: 'guide')
        end

        it 'matches tags case-insensitively' do
          result = described_class.new(skill, user_idp_plan).query
          action_names = result.pluck(:name)

          expect(action_names).to include('Guide Leadership', 'GUIDE Uppercase Tag', 'Guide Mixed Case')
          expect(result.count).to eq(3)
        end
      end

      context 'when user has no level' do
        before do
          campaign_user.update!(level: nil)
        end

        it 'returns all development actions' do
          result = described_class.new(skill, user_idp_plan).query
          action_names = result.pluck(:name)

          expect(action_names).to include('Guide Leadership', 'Apply Communication', 'Shape Mentoring',
                                          'General Action')
          expect(result.count).to eq(4)
        end
      end

      context 'when campaign_user does not exist' do
        before do
          campaign_user.destroy
        end

        it 'returns all development actions' do
          result = described_class.new(skill, user_idp_plan).query
          action_names = result.pluck(:name)

          expect(action_names).to include('Guide Leadership', 'Apply Communication', 'Shape Mentoring',
                                          'General Action')
          expect(result.count).to eq(4)
        end
      end
    end
  end
end
