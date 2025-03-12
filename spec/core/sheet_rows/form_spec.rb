# frozen_string_literal: true

require 'rails_helper'

describe SheetRows::Form do
  it 'validates uniqueness of email is sheet is of type Datasheet' do
    email = Faker::Internet.email
    datasheet = create(:datasheet)
    datasheet.rows.create(email: email)
    form = described_class.new(email: email).with_context(sheet: datasheet)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('Row with email is already present')
  end

  it "doesn't validates uniqueness of email is sheet is of type Accesssheet" do
    email = Faker::Internet.email
    accesssheet = create(:datasheet)
    accesssheet.rows.create(email: email)
    form = described_class.new(email: email).with_context(sheet: accesssheet)

    expect(form.valid?).to eq(false)
  end
end
