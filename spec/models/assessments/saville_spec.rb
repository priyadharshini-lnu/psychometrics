# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessments::Saville, type: :model do
  it 'saves category and status' do
    assessment = create(:assessment, :saville)

    expect(assessment.category).to eq(Assessment::CATEGORIES[:saville])
  end
end
