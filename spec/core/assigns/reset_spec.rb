require 'rails_helper'

describe Assigns::Reset do
  let(:test) { { 'test' => true } }
  let(:membership) { create(:membership, :for_campaign) }
  let!(:assigns_report) do
    create :assigns_report, :licensed, :with_pdf, assign: assign, generating: true
  end
  let!(:assign) do
    create(:assign, membership: membership,
                    results: test,
                    scoring: test,
                    embedded_data: test,
                    status: Assign.statuses[:completed],
                    completed_at: Time.now,
                    step: 100,
                    started_at: Time.now,
                    norm_data: test,
                    agile_scoring: test,
                    occupations: test
    )
  end
  let(:assign_with_result) { assign.assign_with_result }

  subject { described_class.call(assign) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  it 'reset result data for assign with results' do
    expect { subject }.to change { assign_with_result.results }.from(test).to({})
                      .and change { assign_with_result.scoring }.from(test).to({})
                      .and change { assign_with_result.embedded_data }.from(test).to({})
                      .and change { assign_with_result.norm_data }.from(test).to({})
                      .and change { assign_with_result.agile_scoring }.from(test).to({})
                      .and change { assign_with_result.occupations }.from(test).to([])
                      .and change { assign_with_result.status }.from('completed').to('not_started')
                      .and change { assign_with_result.completed_at }.from(Time.now).to(nil)
                      .and change { assign_with_result.started_at }.from(Time.now).to(nil)
                      .and change { assign_with_result.step }.from(100).to(0)

  end

  it 'dont touch original assign' do
    expect { subject }.not_to change { assign.attributes }
  end

  it 'reset assign report data if assessment is completed' do
    expect { subject }.to change { assign.assigns_reports.first.pdf_identifier }.from('test.pdf').to(nil)
                      .and change { assign.assigns_reports.first.generating }.from(true).to(false)
  end

  it 'dont reset assign report data if assessment is NOT completed' do
    allow(assign_with_result).to receive(:completed?).and_return(false)
    expect { subject }.not_to change { assign.assigns_reports.first.attributes }
  end
end
