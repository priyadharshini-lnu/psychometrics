# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::ResetCandidateAssessment, type: :service do
  let!(:project) { create(:project) }
  let(:config) { { 'public_key' => 'public_key_value', 'private_key' => 'private_key_value' } }
  let!(:mettl_integration) { create(:integration, :mettl_integration, project: project) }

  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let!(:mettl_schedule_record) { create(:mettl_schedule_record, project: project, assessment: assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mettl_user_assessment) do
    create(:mettl_user_assessment, user_assessment: user_assessment, mettl_schedule_record_id: mettl_schedule_record.id,
    url: Faker::Internet.url)
  end

  let(:retry_schedule_name) do
    "#{mettl_schedule_record.schedule_name} Retake-#{user_assessment.reset_count}"
  end

  subject { described_class.new(user_assessment) }

  describe '#call' do
    before do
      user_assessment.update!(reset_count: 1)
    end

    context 'when mettl_schedule_record is found' do
      before do
        allow(Mettl::DeleteCandidateResult).to receive(:call!)
      end

      it 'updates the mettl_user_assessment and broadcasts :ok' do
        retry_schedule_record = create(:mettl_schedule_record,
                                       project: project,
                                       assessment: assessment,
                                       schedule_name: retry_schedule_name,
                                       schedule_number: (user_assessment.reset_count + 1))

        expect(subject).to receive(:broadcast).with(:ok)

        subject.call

        expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(retry_schedule_record.id)
      end
    end

    context 'when mettl_schedule_record is not found' do
      before do
        @new_mettl_schedule_record = create(:mettl_schedule_record,
                                            project: project,
                                            assessment: assessment,
                                            duplicated_from_id: mettl_schedule_record.id,
                                            schedule_name: retry_schedule_name)

        allow(Mettl::DeleteCandidateResult).to receive(:call!)
      end

      it 'creates a new mettl_schedule_record, updates the mettl_user_assessment and broadcasts :ok' do
        expect(::Mettl::CreateSchedule).to receive(:call!).with(assessment,
                                                                {
                                                                  name: retry_schedule_name
                                                                }).and_return(@new_mettl_schedule_record)
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call

        expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(@new_mettl_schedule_record.id)
        expect(@new_mettl_schedule_record.duplicated_from_id).to eq(mettl_schedule_record.id)
        expect(@new_mettl_schedule_record.schedule_number).to eq(2)
      end
    end
  end
end
