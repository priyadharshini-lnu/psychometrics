# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveRecordAudit, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:project) { Project.find(create(:project, parent: tenant).id) }
  let(:skill) { create(:skill, project: project) }

  describe 'Tenantable' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :auditable' do
      expect(described_class.tenant_source_association).to eq(%i[auditable user])
    end

    context 'when the auditable record has a tenant_id' do
      it 'inherits tenant_id from the auditable on validation' do
        audit = described_class.new(
          auditable: skill,
          action: 'create',
          audited_changes: {}
        )
        audit.valid?

        expect(audit.tenant_id).to eq(tenant.id)
      end
    end

    context 'when the auditable record has no tenant_id' do
      it 'leaves tenant_id nil' do
        global_dimension = create(:dimension)
        audit = described_class.new(
          auditable: global_dimension,
          action: 'create',
          audited_changes: {}
        )
        audit.valid?

        expect(audit.tenant_id).to be_nil
      end
    end

    context 'when tenant_id is already set' do
      it 'resolves tenant_id from auditable, ignoring the pre-set value' do
        other_tenant = create(:tenancy)
        audit = described_class.new(
          auditable: skill,
          tenant_id: other_tenant.id,
          action: 'update',
          audited_changes: {}
        )
        audit.valid?

        expect(audit.tenant_id).to eq(tenant.id)
      end
    end
  end
end
