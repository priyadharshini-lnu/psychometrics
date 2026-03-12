# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Dimension, type: :model do
  let!(:user) { create(:user) }
  let!(:dimension) { create(:dimension, :with_occupation) }
  let!(:factor) { create(:factor, dimension: dimension) }
  let!(:sub_factor) { create(:factor, dimension: dimension, parent_id: factor.id) }
  let!(:active_record_audit) { ActiveRecordAudit.where(auditable_id: dimension.id) }

  before { factor.sub_factors << sub_factor }

  context '#clone_and_save' do
    it 'should be copy all relative factors, sub-factors and occupation' do
      cloned_dimension = dimension.clone_and_save(user_id: user.id)

      expect(cloned_dimension.factors.count).to be 1
      expect(cloned_dimension.all_factors.count).to be 2
      expect(cloned_dimension.occupations.count).to be 1
    end

    it 'remaps sub_factor_ids and parent_ids to the cloned factors' do
      cloned_dimension = dimension.clone_and_save(user_id: user.id)
      cloned_parent = cloned_dimension.factors.first
      cloned_sub = (cloned_dimension.all_factors - [cloned_parent]).first

      expect(cloned_sub.parent_id).to eq(cloned_parent.id)
      expect(cloned_sub.parent_id).not_to eq(factor.id)

      expect(cloned_parent.sub_factor_ids).to include(cloned_sub.id)
      expect(cloned_parent.sub_factor_ids).not_to include(sub_factor.id)
      expect(cloned_sub.dimension_id).to eq(cloned_dimension.id)
    end
  end

  describe '#create' do
    it 'does create active record audit' do
      expect(ActiveRecordAudit.pluck(:auditable_type)).to include(described_class.name)
      expect(active_record_audit).to be_present
    end
  end

  describe '.skill_rater_dimension' do
    let(:project) { create(:project, name: 'My Project') }

    it 'creates a new skill_rater dimension if not existing' do
      dimension = Dimension.skill_rater_dimension(project)

      expect(dimension).to be_persisted
      expect(dimension.dimension_type).to eq('skill_rater')
      expect(dimension.owner_id).to eq(project.id)
      expect(dimension.name).to eq('My Project - Skill Rater')
    end

    it 'returns existing skill_rater dimension if already present and updates name' do
      existing = Dimension.create!(
        dimension_type: :skill_rater,
        owner_id: project.id,
        name: 'Old Name'
      )

      result = Dimension.skill_rater_dimension(project)

      expect(result.id).to eq(existing.id)
      expect(result.name).to eq('My Project - Skill Rater')
    end
  end
end
