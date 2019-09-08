# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Administration::ReportsController', type: :request do
  # context 'As superadmin' do
  #
  #   let(:current_user)  { create(:superadmin) }
  #   before(:each) { sign_in(current_user) }
  #
  #   context 'GET #hogan_reports' do
  #     let(:psy_assessment_ids) { hogan_assessment_settings.map(&:assessment_id) }
  #     let(:hogan_assessment_ids) { hogan_assessment_settings.map(&:hogan_assessment_id) }
  #     let!(:hogan_assessment_settings) { create_list(:hogan_assessment_setting, 2) }
  #     let(:hogan_report) do
  #       OpenStruct.new({
  #         id: 'Hogan Report',
  #         name: 'Hogan Report',
  #         assessment_ids: hogan_assessment_ids
  #       })
  #     end
  #     let(:hogan_report_item) do
  #       {
  #         name: "#{hogan_report.name} - #{hoagan_report.id}",
  #         id: hogan_report.id
  #       }
  #     end
  #
  #     before(:each) { allow(Settings).to receive_message_chain('providers.hogan.reports') { [hogan_report] } }
  #     subject { get('/administration/reports/hogan_reports.json', params: { assessment_ids: psy_assessment_ids.join(',') }) }
  #
  #     it 'correct format' do
  #       subject
  #       parsed_body = JSON.parse(response.body)
  #
  #       expect(response.status).to eq(200)
  #       expect(response.content_type).to eq 'application/json'
  #       # expect(parsed_body).to include(hogan_report_item)
  #       # expect(assigns(:reports)).to eq([hogan_report])
  #     end
  #
  #     context 'returns empty if there are no matches' do
  #       let(:hogan_assessment_ids) { [hogan_assessment_settings.first.hogan_assessment_id] }
  #       it do
  #         subject
  #         expect(response.status).to eq(200)
  #         expect(response.content_type).to eq 'application/json'
  #         # expect(assigns(:reports)).to be_empty
  #       end
  #     end
  #   end
  # end
end
