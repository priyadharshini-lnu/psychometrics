# frozen_string_literal: true

require 'rails_helper'

describe PaperTrail::Version do
  let(:tenant_a) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:campaign_a) { create(:campaign, project: project_a) }
  let(:user_idp_plan) { create(:user_idp_plan, campaign: campaign_a) }

  describe 'Tenantable' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :item' do
      expect(described_class.tenant_source_association).to eq([:item])
    end

    context 'when created for a tenant-scoped item' do
      it 'inherits tenant_id from the versioned item' do
        action = create(:user_idp_development_action, user_idp_plan: user_idp_plan)

        version = action.versions.last
        expect(version.tenant_id).to eq(tenant_a.id)
      end
    end
  end
end

describe PaperTrail::VersionAssociation do
  describe 'Tenantable' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :version' do
      expect(described_class.tenant_source_association).to eq([:version])
    end
  end
end
