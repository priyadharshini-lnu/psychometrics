# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OccupationConditionSet, type: :model do
  let(:dimension) { create(:dimension, occupations_enabled: true) }
  let(:occupation_condition_set) { dimension.default_occupation_condition_set }

  describe 'before_destroy' do
    it 'prevents destroying the default occupation condition set' do
      ocs = occupation_condition_set

      expect { ocs.destroy }.not_to change(OccupationConditionSet, :count)
      expect(ocs.errors[:base]).to include('Cannot delete the default occupation condition set')
    end

    it 'allows destroying a non-default occupation condition set' do
      non_default = create(:occupation_condition_set, dimension: dimension, name: 'Custom')

      expect { non_default.destroy }.to change(OccupationConditionSet, :count).by(-1)
    end
  end
end
