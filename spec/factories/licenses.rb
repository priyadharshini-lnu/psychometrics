FactoryGirl.define do
  factory :license do
    number 100
    License.types.keys.each do |name|
      trait name.to_sym do
        type name
      end
    end
  end
end
