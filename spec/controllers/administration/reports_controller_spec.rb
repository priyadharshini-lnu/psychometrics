# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::ReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:report) { create(:report) }
  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'DELETE soft_delete' do
    delete :soft_delete, params: { id: report.id }, format: :js

    expect(report.reload.deleted_at).to_not eq(nil)
    expect(report.deleted_by).to eq(current_user)
    expect(response).to render_template('soft_delete')
  end

  it 'PUT restore' do
    report.soft_delete!(current_user)
    put :restore, params: { id: report.id }, format: :js

    expect(report.reload.deleted_at).to eq(nil)
    expect(report.deleted_by).to eq(nil)
    expect(response).to render_template('refresh_list')
  end
end
