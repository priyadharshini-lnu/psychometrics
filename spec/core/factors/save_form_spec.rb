# frozen_string_literal: true

require 'rails_helper'

describe Factors::SaveForm do
  let(:factor_one) { create(:factor) }
  let(:factor_two) { create(:factor) }
  before do
    create(:factors_sub_factor, factor: factor_one, sub_factor: factor_two)
  end
  let(:factors_sub_factor) { create(:factors_sub_factor, project: project) }
  it 'avoid_cyclic_references' do
    form = described_class.
           new(
             id: factor_two.id,
             factors_sub_factors_attributes: { any: { 'id' => '', 'sub_factor_id' => factor_one.id } }
           )

    form.validate
    expect(form.errors.messages[:factors_sub_factors_attributes].first.first).to eq factor_one.id
  end
end
