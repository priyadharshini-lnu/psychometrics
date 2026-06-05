# frozen_string_literal: true

require 'rails_helper'

describe Microsite::SaveAssessments do
  describe '.call' do
    let(:project) { create(:project) }

    let(:assessments) do
      [
        {
          'assessmentId' => 'ms-assessment-001',
          'name' => 'Communication Skills',
          'questions' => { 'q1' => { 'kind' => 'single_choice', 'prompts' => ['How do you communicate?'] } }
        },
        {
          'assessmentId' => 'ms-assessment-002',
          'name' => 'Leadership Assessment',
          'questions' => { 'q2' => { 'kind' => 'single_choice', 'prompts' => ['Describe your leadership style'] } }
        }
      ]
    end

    before do
      allow(Sentry).to receive(:capture_exception)
    end

    context 'when saving new assessments' do
      it 'creates new MicrositeAssessment records' do
        expect do
          described_class.call(project, assessments)
        end.to change(MicrositeAssessment, :count).by(2)

        first_assessment = MicrositeAssessment.find_by(product_id: 'ms-assessment-001')
        expect(first_assessment).to have_attributes(
          project_id: project.id,
          name: 'Communication Skills',
          metadata: { 'questions' => { 'q1' => { 'kind' => 'single_choice',
                                                 'prompts' => ['How do you communicate?'] } } }
        )

        second_assessment = MicrositeAssessment.find_by(product_id: 'ms-assessment-002')
        expect(second_assessment).to have_attributes(
          project_id: project.id,
          name: 'Leadership Assessment',
          metadata: { 'questions' => { 'q2' => { 'kind' => 'single_choice',
                                                 'prompts' => ['Describe your leadership style'] } } }
        )
      end
    end

    context 'when updating existing assessments' do
      let!(:existing_assessment) do
        MicrositeAssessment.create!(
          project_id: project.id,
          product_id: 'ms-assessment-001',
          name: 'Old Name',
          metadata: { 'questions' => {} }
        )
      end

      it 'updates the existing assessment records' do
        expect do
          described_class.call(project, assessments)
        end.to change(MicrositeAssessment, :count).by(1)

        existing_assessment.reload
        expect(existing_assessment).to have_attributes(
          name: 'Communication Skills',
          metadata: { 'questions' => { 'q1' => { 'kind' => 'single_choice',
                                                 'prompts' => ['How do you communicate?'] } } }
        )
      end
    end

    context 'when handling duplicate records' do
      before do
        MicrositeAssessment.create!(
          project_id: project.id,
          product_id: 'ms-assessment-001',
          name: 'Duplicate Test'
        )
      end

      it 'captures the exception and continues processing' do
        allow(MicrositeAssessment).to receive(:find_or_initialize_by).and_call_original
        allow_any_instance_of(MicrositeAssessment).to receive(:update!).and_raise(
          ActiveRecord::RecordNotUnique.new('duplicate key value')
        )

        expect(Sentry).to receive(:capture_exception).at_least(:once)

        # Should not raise an error
        expect { described_class.call(project, assessments) }.not_to raise_error
      end
    end

    context 'with empty assessments array' do
      it 'does nothing' do
        expect do
          described_class.call(project, [])
        end.not_to change(MicrositeAssessment, :count)
      end
    end

    context 'when syncing question mappings' do
      let!(:lighthouse_assessment) do
        create(:assessment, :microsite,
               project: project,
               external_settings: {
                 'assessment_id' => 'ms-assessment-001',
                 'question_mappings' => { 'q1' => '100' }
               })
      end

      let(:assessments) do
        [
          {
            'assessmentId' => 'ms-assessment-001',
            'name' => 'Communication Skills',
            'questions' => {
              'q1' => { 'kind' => 'single_choice' },
              'user-profile' => { 'kind' => 'form', 'fields' => [] },
              'q2' => { 'kind' => 'single_choice' }
            }
          }
        ]
      end

      it 'adds new catalog questions to existing question mappings' do
        described_class.call(project, assessments)

        mappings = Assessment.find(lighthouse_assessment.id).external_settings['question_mappings']

        expect(mappings).to eq({
          'q1' => '100',
          'user-profile' => nil,
          'q2' => nil
        })
      end

      it 'does not overwrite existing mappings' do
        described_class.call(project, assessments)

        mappings = Assessment.find(lighthouse_assessment.id).external_settings['question_mappings']
        expect(mappings['q1']).to eq('100')
      end
    end
  end
end
