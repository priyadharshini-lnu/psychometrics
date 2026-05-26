# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::FetchAssessmentsJob, type: :job do
  describe '#perform' do
    let(:project) { create(:project) }
    let(:assessments) do
      [
        { 'id' => 'ms-001', 'name' => 'Test Assessment', 'metadata' => {} }
      ]
    end

    before do
      create(:integration, :microsite, project: project)
    end

    it 'fetches and saves assessments for the project' do
      expect(Microsite::GetAssessments).to receive(:call!).with(an_instance_of(Client)).and_return(assessments)
      expect(Microsite::SaveAssessments).to receive(:call).with(an_instance_of(Client), assessments)

      described_class.perform_now(project.id)
    end

    it 'does nothing when project is not found' do
      expect(Microsite::GetAssessments).not_to receive(:call!)
      expect(Microsite::SaveAssessments).not_to receive(:call)

      described_class.perform_now(999)
    end

    it 'does nothing when project has no microsite integration' do
      project_without_integration = create(:project)

      expect(Microsite::GetAssessments).not_to receive(:call!)
      expect(Microsite::SaveAssessments).not_to receive(:call)

      described_class.perform_now(project_without_integration.id)
    end

    context 'when assessments are empty' do
      let(:empty_assessments) { [] }

      it 'does not call SaveAssessments' do
        expect(Microsite::GetAssessments).to receive(:call!).and_return(empty_assessments)
        expect(Microsite::SaveAssessments).not_to receive(:call)

        described_class.perform_now(project.id)
      end
    end

    context 'when assessments are nil' do
      it 'does not call SaveAssessments' do
        expect(Microsite::GetAssessments).to receive(:call!).and_return(nil)
        expect(Microsite::SaveAssessments).not_to receive(:call)

        described_class.perform_now(project.id)
      end
    end
  end
end
