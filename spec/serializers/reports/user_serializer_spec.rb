# frozen_string_literal: true

require 'rails_helper'

describe Reports::UserSerializer do
  let(:assign1) { double(completed_at:  DateTime.parse('3rd Feb 2001 04:05:06+03:30')) }
  let(:assign2) { double(completed_at:  DateTime.parse('4rd Feb 2001 04:05:06+03:30')) }

  subject { Reports::UserSerializer.new(double(), assigns: [assign1, assign2]) }
  it 'formats completed_at for multiple assigns' do
    expect(subject.completed_at).to eq('3 Feb 2001 - 4 Feb 2001')
  end
end
