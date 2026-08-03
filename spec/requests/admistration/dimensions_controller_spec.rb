# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::DimensionsController, type: :request do
  let(:current_user) { create(:superadmin) }
  let(:client) { create(:tenancy, name: 'Alpha Client', type: 'partner') }
  let(:client_id) { client.id }

  before(:each) { login_user(current_user) }

  describe 'POST /administration/dimensions' do
    context 'with correct params' do
      it 'creates request and active record logs' do
        post administration_dimensions_path, params: { resource: { name: 'Alpha Test', owner_id: client_id } }

        dimension = Dimension.last
        request_log = AuditLog.find_by(record_id: dimension.id, record_type: 'Dimension')
        active_record_logs = request_log.active_record_audits
        active_record_log_uuids = active_record_logs.pluck(:request_uuid)

        expect(dimension.created_by).to eq(current_user)
        expect(dimension.updated_by).to eq(current_user)
        expect(request_log).to be_present
        expect(active_record_logs).to be_present
        expect(active_record_log_uuids.all?(request_log.request_uuid)).to be true
      end
    end
  end

  describe 'POST /administration/dimensions/:id/copy' do
    it 'creates copy job with skip_owner_validation enabled' do
      dimension = create(:dimension, owner: client)

      expect do
        post "/administration/dimensions/#{dimension.id}/copy"
      end.to change(AdminJobRecord, :count).by(1)

      job = AdminJobRecord.order(:created_at).last
      expect(job.operation).to eq('copy_dimension')
      expect(job.data['dimension_id']).to eq(dimension.id)
      expect(job.data['skip_owner_validation']).to eq(true)
    end
  end
end
