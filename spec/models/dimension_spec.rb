# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Dimension, type: :model do
  let!(:user) { create(:user) }
  let!(:dimension) { create(:dimension, :with_occupation) }
  let!(:factor) { create(:factor, sub_factors: [create(:factor)], dimension: dimension) }
  let!(:active_record_audit) { ActiveRecordAudit.where(auditable_id: dimension.id) }

  context '#clone_and_save' do
    it 'should be copy all relative factors, sub-factors and occupation' do
      cloned_dimension = dimension.clone_and_save(user_id: user.id)
      expect(cloned_dimension.factors.count).to be 1
      expect(cloned_dimension.factors.first.sub_factors.count).to be 1
      expect(cloned_dimension.occupations.count).to be 1
    end
  end

  describe '#create' do
    it 'does create active record audit' do
      expect(ActiveRecordAudit.pluck(:auditable_type)).to include(described_class.name)
      expect(active_record_audit).to be_present
    end
  end

  describe '.skills_rater_dimension' do
    let(:project) { create(:project, name: 'My Project') }

    it 'creates a new skills_rater dimension if not existing' do
      dimension = Dimension.skills_rater_dimension(project)

      expect(dimension).to be_persisted
      expect(dimension.dimension_type).to eq('skills_rater')
      expect(dimension.owner_id).to eq(project.id)
      expect(dimension.name).to eq('My Project - Skills Rater')
    end

    it 'returns existing skills_rater dimension if already present and updates name' do
      existing = Dimension.create!(
        dimension_type: :skills_rater,
        owner_id: project.id,
        name: 'Old Name'
      )

      result = Dimension.skills_rater_dimension(project)

      expect(result.id).to eq(existing.id)
      expect(result.name).to eq('My Project - Skills Rater')
    end
  end
end
