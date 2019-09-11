# frozen_string_literal: true

require 'rails_helper'

# TODO: (atanych): What do these tests check?
describe 'Exports::Assessments::AssessmentResultsExport' do
  let(:assessment) { create(:assessment) }
  let(:client_id) { 0 }
  let(:exporter) { Exports::Assessments::AssessmentResultsExport.new(assessment, client_id) }

  describe '#current_level_assigns' do
    before do
      expect(Client).to receive(:find).with(client_id).and_return(project)
      expect(query_object).to receive(:call).with(client_id, assessment.id).and_return(Assign.none)
    end

    context 'for assessment in project level' do
      let(:project) { double('project', project?: true) }
      let(:query_object) { Queries::Assigns::ProjectLevel::ByClientAndAssessment }

      it 'calls Queries::Assigns::ProjectLevel::ByClientAndAssessment' do
        exporter.current_level_assigns
      end
    end

    context 'for assessment in subproject level' do
      let(:project) { double('project', project?: false) }
      let(:query_object) { Queries::Assigns::SubProjectLevel::ByClientAndAssessment }

      it 'calls Queries::Assigns::SubProjectLevel::ByClientAndAssessment' do
        exporter.current_level_assigns
      end
    end
  end
end
