# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DimensionResource do
  let(:superadmin) { create(:superadmin) }
  let(:user) { create(:user) }

  describe '.creatable_fields' do
    context 'for superadmin' do
      it 'includes default_occupation_condition_set_id' do
        fields = described_class.creatable_fields(user: superadmin)
        expect(fields).to include(:default_occupation_condition_set_id)
      end
    end

    context 'for non-superadmin' do
      it 'excludes default_occupation_condition_set_id' do
        fields = described_class.creatable_fields(user: user)
        expect(fields).not_to include(:default_occupation_condition_set_id)
      end
    end
  end

  describe '.updatable_fields' do
    context 'for superadmin' do
      it 'includes default_occupation_condition_set_id' do
        fields = described_class.updatable_fields(user: superadmin)
        expect(fields).to include(:default_occupation_condition_set_id)
      end
    end

    context 'for non-superadmin' do
      it 'excludes default_occupation_condition_set_id' do
        fields = described_class.updatable_fields(user: user)
        expect(fields).not_to include(:default_occupation_condition_set_id)
      end
    end
  end
end
