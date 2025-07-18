# frozen_string_literal: true

require 'rails_helper'

describe Idp::BulkGenerate do
  let(:manager) { create(:user) }
  let(:idp_user) { create(:user, manager: manager) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: idp_user, idp_template: idp_template, status: 'draft') }
  let(:job_record) { create(:admin_job_record, owner: manager, data: { ids: [user_idp_plan.id], lang: 'en' }) }

  it 'calls Idp::Generate for each user_idp_plan' do
    expect(UserReports::GenerateIdpReportPdf).to receive(:call).with(
      user_idp_plan,
      manager,
      admin_job_record_id: job_record.id,
      lang: 'en',
      include_reflective_questions: false,
      update_record: false
    )

    Idp::BulkGenerate.call(
      user_idp_plans: [user_idp_plan],
      current_user: manager,
      job_record: job_record
    )
    expect(job_record.total_tasks).to eq(1)
  end

  it 'returns error if no user_idp_plans are provided' do
    result = Idp::BulkGenerate.call(
      user_idp_plans: [],
      current_user: manager,
      job_record: job_record
    )

    expect(result[:ok][:error_messages]).to include(I18n.t('administration.bulk_reports.reports_unavailable'))
  end
end
