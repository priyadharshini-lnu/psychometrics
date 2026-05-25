# frozen_string_literal: true

require 'rails_helper'

describe ActsAsTaggableOn::Tagging do
  let(:tenant_a) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:campaign_a) { create(:campaign, project: project_a) }

  describe 'Tenantable' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :taggable' do
      expect(described_class.tenant_source_association).to eq([:taggable])
    end

    context 'when applied to a tenant-scoped record' do
      it 'inherits tenant_id from the taggable' do
        campaign_a.tag_list.add('leadership')
        campaign_a.save!

        tagging = ActsAsTaggableOn::Tagging.find_by(taggable: campaign_a)
        expect(tagging.tenant_id).to eq(tenant_a.id)
      end
    end
  end
end
