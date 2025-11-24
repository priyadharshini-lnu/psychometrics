# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessments::Yoodli, type: :model do
  it 'saves category and status' do
    assessment = create(:assessment, :yoodli)

    expect(assessment.category).to eq(Assessment::CATEGORIES[:yoodli])
    expect(assessment.status).to eq('in_progress')
  end
end
