# frozen_string_literal: true

require 'rails_helper'

describe Skillvue::SaveAssessments do
  describe '.call' do
    let(:project) { create(:project) }

    let(:assessments) do
      [
        {
          'alias' => '36d0676c454f67d39e67aee0699a2edd',
          'name' => 'MTE Test',
          'expiration' => nil,
          'iso_code' => 'en'
        },
        {
          'alias' => 'abc123456789def',
          'name' => 'Technical Assessment',
          'expiration' => '2025-12-31',
          'iso_code' => 'fr'
        }
      ]
    end

    before do
      allow(Sentry).to receive(:capture_exception)
    end

    context 'when saving new assessments' do
      it 'creates new SkillvueAssessment records' do
        expect do
          described_class.call(project, assessments)
        end.to change(SkillvueAssessment, :count).by(2)

        # Verify first assessment
        first_assessment = SkillvueAssessment.find_by(product_id: '36d0676c454f67d39e67aee0699a2edd')
        expect(first_assessment).to have_attributes(
          project_id: project.id,
          name: 'MTE Test',
          expiration: nil,
          iso_code: 'en'
        )

        # Verify second assessment
        second_assessment = SkillvueAssessment.find_by(product_id: 'abc123456789def')
        expect(second_assessment).to have_attributes(
          project_id: project.id,
          name: 'Technical Assessment',
          expiration: '2025-12-31'.to_date,
          iso_code: 'fr'
        )
      end
    end

    context 'when updating existing assessments' do
      let!(:existing_assessment) do
        SkillvueAssessment.create!(
          project_id: project.id,
          product_id: '36d0676c454f67d39e67aee0699a2edd',
          name: 'Old Name',
          expiration: '2023-01-01'.to_date,
          iso_code: 'es'
        )
      end

      it 'updates the existing assessment records' do
        # Only one new record
        expect do
          described_class.call(project, assessments)
        end.to change(SkillvueAssessment, :count).by(1)
        # Verify the existing record was updated
        existing_assessment.reload
        expect(existing_assessment).to have_attributes(
          name: 'MTE Test',
          expiration: nil,
          iso_code: 'en'
        )
      end
    end

    context 'when a uniqueness violation occurs' do
      it 'captures the exception with Sentry' do
        # Set up the uniqueness violation
        error = ActiveRecord::RecordNotUnique.new('Duplicate entry')
        allow_any_instance_of(SkillvueAssessment).to receive(:update!).and_raise(error)

        described_class.call(project, [assessments.first])

        expect(Sentry).to have_received(:capture_exception).with(
          error,
          extra: {
            project_id: project.id,
            product_id: '36d0676c454f67d39e67aee0699a2edd'
          }
        )
      end
    end

    context 'with empty assessments array' do
      it 'does not create any records' do
        expect do
          described_class.call(project, [])
        end.not_to change(SkillvueAssessment, :count)
      end
    end
  end
end
