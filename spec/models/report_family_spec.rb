# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportFamily, type: :model do
  describe 'owner compatibility with associated licenses' do
    let(:owner_mismatch_message) do
      I18n.t('admin.owner_resource_mismatch',
             child_resource: I18n.t('admin.owner_resource_client'),
             parent_resource: I18n.t('admin.owner_resource_report_bundle'))
    end

    let(:owner_a) { create(:tenancy) }
    let(:owner_b) { create(:tenancy) }

    let!(:report_family) { create(:report_family, tenant_id: owner_a.id) }
    let!(:license) { create(:license, type: 'common', report_family: report_family, client: owner_a) }

    it 'is invalid when owner changes to a value incompatible with associated licenses' do
      report_family[:tenant_id] = owner_b.id

      expect(report_family).not_to be_valid
      expect(report_family.errors[:tenant_id]).to include(owner_mismatch_message)
    end

    it 'is valid when owner changes to nil' do
      report_family[:tenant_id] = nil

      expect(report_family).to be_valid
    end

    it 'does not run owner compatibility check when owner is unchanged' do
      license.update_column(:client_id, owner_b.id)

      report_family.name = 'Updated bundle name'

      expect(report_family).to be_valid
    end

    it 'does not run owner compatibility check when there are no licenses' do
      report_family.licenses.destroy_all

      report_family[:tenant_id] = owner_b.id

      expect(report_family).to be_valid
    end
  end
end
