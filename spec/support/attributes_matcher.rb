RSpec::Matchers.define :have_attributes do |attributes|
  match do |records|
    records.each.with_index do |record, index|
      expected_attributes = record.slice(attributes.first.keys)
      expect(expected_attributes).to eq(attributes[index])
    end
  end

  failure_message do |actual|
    "Expected #{actual.map{ |a| a.slice(expected.first.keys) }} to have attributes #{expected}."
  end
end
