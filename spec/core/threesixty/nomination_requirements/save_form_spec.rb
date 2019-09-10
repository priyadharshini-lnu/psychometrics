# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::SaveForm do
  it 'validates presence of name' do
    form = described_class.new(position: 1)
    form.validate

    expect(form.errors.messages[:name]).to include("can't be blank")
  end

  it 'validates presence of position' do
    form = described_class.new(name: 'Requirement 1')
    form.validate

    expect(form.errors.messages[:position]).to include("can't be blank")
  end
end
