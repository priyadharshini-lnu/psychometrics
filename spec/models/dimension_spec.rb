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
end
