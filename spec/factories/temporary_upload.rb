# frozen_string_literal: true

FactoryBot.define do
  factory :temporary_upload do
    user
    file_key { "#{Settings.aws.s3.temporary_upload_folder}/#{SecureRandom.uuid}/test.png" }
    filename { 'test.png' }
    content_type { 'image/png' }
    byte_size { 1024 }
    checksum { 'MDEyMzQ1Njc4OWFiY2RlZg==' }
    service_name { 'aws' }
    bucket { 'public-bucket' }
    status { :pending }
  end
end
