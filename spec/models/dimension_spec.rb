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

  describe 'after_create' do
    it 'creates a default occupation condition set when occupations are enabled' do
      new_dimension = create(:dimension, occupations_enabled: true)

      expect(new_dimension.default_occupation_condition_set).to be_present
      expect(new_dimension.default_occupation_condition_set.name).to eq('Default')
    end

    it 'does not create an occupation condition set when occupations are disabled' do
      new_dimension = create(:dimension, occupations_enabled: false)

      expect(new_dimension.default_occupation_condition_set).to be_nil
      expect(new_dimension.occupation_condition_sets).to be_empty
    end
  end

  describe 'after_update' do
    context 'when occupations_enabled is toggled to true' do
      it 'creates a default occupation condition set when none exist' do
        new_dimension = create(:dimension, occupations_enabled: false)

        new_dimension.update!(occupations_enabled: true)

        expect(new_dimension.reload.default_occupation_condition_set).to be_present
        expect(new_dimension.default_occupation_condition_set.name).to eq('Default')
      end

      it 'assigns the existing condition set as default when one already exists' do
        new_dimension = create(:dimension, occupations_enabled: false)
        existing_set = create(:occupation_condition_set, dimension: new_dimension, name: 'Custom Set')

        new_dimension.update!(occupations_enabled: true)

        expect(new_dimension.reload.default_occupation_condition_set).to eq(existing_set)
      end

      it 'does not change the default if one is already assigned' do
        new_dimension = create(:dimension, occupations_enabled: true)
        original_default = new_dimension.default_occupation_condition_set

        new_dimension.update!(occupations_enabled: false)
        new_dimension.update!(occupations_enabled: true)

        expect(new_dimension.reload.default_occupation_condition_set).to eq(original_default)
      end
    end
  end

  describe 'before_destroy' do
    it 'can be destroyed without being blocked by the default condition set' do
      dimension_to_destroy = create(:dimension)

      expect { dimension_to_destroy.destroy! }.not_to raise_error
    end
  end

  describe 'owner updates with linked records' do
    let(:owner_a) { create(:tenancy) }
    let(:owner_b) { create(:tenancy) }

    it 'allows owner change even when linked assessment and norm owners differ after update' do
      dimension = create(:dimension, owner: owner_a)
      create(:assessment, owner: owner_a, dimension: dimension)
      create(:norm, owner: owner_a, dimension: dimension, skip_owner_validation: true)

      dimension.owner = owner_b

      expect(dimension).to be_valid
      expect(dimension.save).to eq(true)
    end
  end
end
