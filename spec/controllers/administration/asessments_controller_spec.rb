# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::AssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:assessment) { create(:assessment) }
  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'DELETE soft_delete' do
    delete :soft_delete, params: { id: assessment.id }, format: :js

    expect(assessment.reload.deleted_at).to_not eq(nil)
    expect(assessment.deleted_by).to eq(current_user)
    expect(response).to render_template('soft_delete')
  end

  it 'PUT restore' do
    assessment.soft_delete!(current_user)
    put :restore, params: { id: assessment.id }, format: :js

    expect(assessment.reload.deleted_at).to eq(nil)
    expect(assessment.deleted_by).to eq(nil)
    expect(response).to render_template('refresh_list')
  end
end
