# frozen_string_literal: true

FactoryBot.define do
  factory :integration do
    project
    name { Integration.names.keys.first }

    trait :hogan_integration do
      name { 'hogan' }
      config { { provider: 'mercer' } }
    end

    trait :mettl_integration do
      name { 'mettl' }
      config do
        {
          api_base_url: 'https://api.mettl.com',
          public_key: Base64.encode64(Encryptor.encrypt('public_key_sample')),
          private_key: Base64.encode64(Encryptor.encrypt('public_key_sample'))
        }
      end
    end

    trait :microsite do
      name { 'microsite' }
      config do
        {
          api_key: Base64.encode64(Encryptor.encrypt('test-api-key'))
        }
      end
    end
  end
end
