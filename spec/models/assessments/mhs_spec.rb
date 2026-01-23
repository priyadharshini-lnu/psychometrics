# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessments::Mhs, type: :model do
  it 'saves category and status' do
    assessment = create(:assessment, :mhs)

    expect(assessment.category).to eq(Assessment::CATEGORIES[:mhs])
  end
end
