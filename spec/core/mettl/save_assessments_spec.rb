# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::SaveAssessments, type: :service do
  describe '.call' do
    let(:project) { create(:project) }
    let(:assessments) do
      [
        {
          'id' => '123',
          'name' => 'Assessment 1',
          'duration' => 60,
          'registrationFields' => %w[field1 field2],
          'instructions' => 'Instructions 1',
          'defaultInstructions' => 'Default Instructions 1'
        },
        {
          'id' => '456',
          'name' => 'Assessment 2',
          'duration' => 45,
          'registrationFields' => %w[field3 field4],
          'instructions' => 'Instructions 2',
          'defaultInstructions' => 'Default Instructions 2'
        }
      ]
    end

    it 'creates new MettlAssessment records or updates existing ones' do
      expect do
        Mettl::SaveAssessments.call(project, assessments)
      end.to change { MettlAssessment.count }.by(2)

      assessment1 = MettlAssessment.find_by(project_id: project.id, product_id: '123')
      assessment2 = MettlAssessment.find_by(project_id: project.id, product_id: '456')

      expect(assessment1).to have_attributes(
        name: 'Assessment 1',
        duration: 60,
        registration_fields: %w[field1 field2],
        instructions: 'Instructions 1',
        default_instructions: 'Default Instructions 1'
      )

      expect(assessment2).to have_attributes(
        name: 'Assessment 2',
        duration: 45,
        registration_fields: %w[field3 field4],
        instructions: 'Instructions 2',
        default_instructions: 'Default Instructions 2'
      )
    end

    it 'updates existing records if they already exist' do
      Mettl::SaveAssessments.call(project, assessments)

      assessment = MettlAssessment.find_by(project_id: project.id, product_id: '123')
      expect(assessment.name).to eq('Assessment 1')
    end
  end
end
