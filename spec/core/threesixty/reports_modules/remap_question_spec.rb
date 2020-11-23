# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ReportsModules::RemapQuestion do
  let(:report) { create(:report) }
  let(:page) { create(:page, report: report) }
  let(:old_question) { create(:question) }
  let(:new_question) { create(:question, name: 'new question') }
  let(:questions_mapping) do
    questions_mapping = {}
    questions_mapping[old_question.id] = new_question.id
    questions_mapping
  end

  it 'maps single questionId inside props to new question id' do
    report_module = create(:module, page: page, props: { questionId: old_question.id })

    described_class.call(report, questions_mapping)

    expect(report_module.reload.props['questionId']).to eq(new_question.id)
  end
end
