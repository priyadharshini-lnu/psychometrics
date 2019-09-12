# frozen_string_literal: true

require 'rails_helper'

describe 'Exports::Assessments::CompletionStatusExport' do
  let(:client_id) { 0 }
  let(:exporter) { Exports::Assessments::CompletionStatusExport.new(client_id) }

  describe '#current_level_assigns' do
    before do
      expect(Client).to receive(:find).with(client_id).and_return(project)
      expect(query_object).to receive(:call).with(client_id).and_return(Assign.none)
    end

    context 'for assessments in project level' do
      let(:project) { double('project', project?: true) }
      let(:query_object) { Queries::Assigns::ProjectLevel::ByClient }

      it 'calls Queries::Assigns::ProjectLevel::ByClient' do
        exporter.current_level_assigns
      end
    end

    context 'for assessments in subproject level' do
      let(:project) { double('project', project?: false) }
      let(:query_object) { Queries::Assigns::SubProjectLevel::ByClient }

      it 'calls Queries::Assigns::SubProjectLevel::ByClient' do
        exporter.current_level_assigns
      end
    end
  end
end
