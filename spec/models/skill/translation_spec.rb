# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skill::Translation, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:project) { Project.find(create(:project, parent: tenant).id) }
  let(:skill) { create(:skill, project: project) }

  describe 'Tenantable (injected via initializer)' do
    it 'includes Tenantable' do
      expect(described_class.ancestors).to include(Tenantable)
    end

    it 'declares tenant_source :translated_model' do
      expect(described_class.tenant_source_association).to eq([:translated_model])
    end

    context 'when the parent skill has a tenant_id' do
      it 'inherits tenant_id from the parent skill on validation' do
        translation = described_class.new(translated_model: skill, locale: 'en')
        translation.valid?

        expect(translation.tenant_id).to eq(tenant.id)
      end
    end

    context 'when the parent skill has no tenant_id' do
      it 'leaves tenant_id nil' do
        global_skill = create(:skill, project: nil)
        translation = described_class.new(translated_model: global_skill, locale: 'en')
        translation.valid?

        expect(translation.tenant_id).to be_nil
      end
    end

    context 'when tenant_id is already set' do
      it 'overwrites it with the derived tenant_id from parent skill' do
        other_tenant = create(:tenancy)
        translation = described_class.new(
          translated_model: skill,
          tenant_id: other_tenant.id,
          locale: 'en'
        )
        translation.valid?

        expect(translation.tenant_id).to eq(tenant.id)
      end
    end
  end
end
