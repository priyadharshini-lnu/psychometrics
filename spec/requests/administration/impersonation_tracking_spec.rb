# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Impersonation Tracking in Audit Logs', type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:tenancy) { create(:tenancy) }
  let(:client_admin) { create(:client_admin, client: tenancy) }

  describe 'AuditLogModule.audit!' do
    it 'persists impersonated_by_id when passed as an option' do
      AuditLogModule.audit!(:test_direct, client_admin,
                            user: client_admin,
                            impersonated_by_id: superadmin.id)

      log = AuditLog.find_by(action: 'test_direct')
      expect(log.impersonated_by_id).to eq(superadmin.id)
      expect(log.impersonator).to eq(superadmin)
    end

    it 'leaves impersonated_by_id nil when not passed' do
      AuditLogModule.audit!(:test_no_impersonation, client_admin, user: client_admin)

      log = AuditLog.find_by(action: 'test_no_impersonation')
      expect(log.impersonated_by_id).to be_nil
      expect(log.impersonator).to be_nil
    end
  end

  describe 'AuditLog model' do
    it 'belongs_to impersonator' do
      log = AuditLog.create!(
        action: 'test_association',
        user: client_admin,
        impersonated_by_id: superadmin.id,
        client: tenancy
      )

      expect(log.reload.impersonator).to eq(superadmin)
      expect(log.impersonator.email).to eq(superadmin.email)
    end

    it 'allows nil impersonator' do
      log = AuditLog.create!(
        action: 'test_nil_association',
        user: client_admin,
        client: tenancy
      )

      expect(log.reload.impersonator).to be_nil
    end
  end
end
