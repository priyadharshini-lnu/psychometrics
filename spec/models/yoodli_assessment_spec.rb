# frozen_string_literal: true

require 'rails_helper'

RSpec.describe YoodliAssessment, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:project).class_name('Client') }
  end

  describe 'scopes' do
    let(:project) { create(:project) }
    let!(:yoodli_assessment1) do
      create(:yoodli_assessment, name: 'Public Speaking', product_id: 'yoodli-123', project: project)
    end
    let!(:yoodli_assessment2) do
      create(:yoodli_assessment, name: 'Interview Skills', product_id: 'yoodli-456', project: project)
    end

    describe '.filterable_fields' do
      it 'filters by name' do
        results = described_class.filterable_fields('Public')
        expect(results).to include(yoodli_assessment1)
        expect(results).not_to include(yoodli_assessment2)
      end

      it 'filters by product_id' do
        results = described_class.filterable_fields('123')
        expect(results).to include(yoodli_assessment1)
        expect(results).not_to include(yoodli_assessment2)
      end

      it 'is case insensitive' do
        results = described_class.filterable_fields('public')
        expect(results).to include(yoodli_assessment1)
      end
    end
  end

  describe 'auditing' do
    it 'is audited' do
      expect(described_class.ancestors).to include(Audited::Auditor::AuditedInstanceMethods)
    end
  end
end
