# frozen_string_literal: true

FactoryBot.define do
  factory :saville_assessment_setting do
    assessment
    saville_norm_id { '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337' }
    saville_assessment_id { 'A830E4AB-BC66-4238-92E0-6E6FD3FD1EDF' }
  end
end
