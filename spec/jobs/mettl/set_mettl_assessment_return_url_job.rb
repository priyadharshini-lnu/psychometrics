# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::SetMettlAssessmentReturnUrlJob, type: :job do
  include ActiveJob::TestHelper

  let(:project) { create(:project, subdomain: 'example') }
  let(:mettl_assessment) { create(:mettl_assessment, project: project, product_id: '12345') }
  let(:external_assessment_id) { '12345' }
  let(:request_body) { { exitRedirectionURL: "http://example.ttedev.me:31338/mettl/assessment/#{mettl_assessment.id}" } }

  before do
    allow(Mettl::EditAssessment).to receive(:call!).with(mettl_assessment, request_body)
  end

  describe '#perform' do
    context 'when the MettlAssessment is found' do
      it 'calls Mettl::EditAssessment with the correct parameters' do
        expect(Mettl::EditAssessment).to receive(:call!).with(mettl_assessment, request_body)
        described_class.perform_now(external_assessment_id)
      end
    end

    context 'when the MettlAssessment is not found' do
      before do
        allow(MettlAssessment).to receive(:find_by).with(product_id: external_assessment_id).
          and_return(nil)
      end

      it 'does not call Mettl::EditAssessment' do
        expect(Mettl::EditAssessment).not_to receive(:call!)
        described_class.perform_now(external_assessment_id)
      end
    end
  end
end
