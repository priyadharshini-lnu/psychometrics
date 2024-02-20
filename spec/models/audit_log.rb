# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuditLog, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:action) }
  end

  describe '#create' do
    it 'does not create active record audit' do
      create(:audit_log)

      expect(ActiveRecordAudit.pluck(:auditable_type)).not_to include(described_class)
    end
  end
end
