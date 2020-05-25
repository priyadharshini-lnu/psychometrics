# require "carrierwave_direct/policies/base"

# module CarrierWaveDirect
#   module Policies
#     class Aws4HmacSha256 < Base

#       def generate(options, &block)

#         return @policy if @policy.present?
#         conditions = []

#         conditions << ["starts-with", "$utf8", ""] if options[:enforce_utf8]
#         conditions << ["starts-with", "$key", uploader.key.sub(/#{Regexp.escape(CarrierWaveDirect::Uploader::FILENAME_WILDCARD)}\z/, "")]
#         conditions << {'X-Amz-Algorithm' => algorithm}
#         conditions << {'X-Amz-Credential' => credential}
#         conditions << {'X-Amz-Date' => date }
#         conditions << ["starts-with", "$Content-Type", ""] if uploader.will_include_content_type
#         conditions << {"bucket" => uploader.fog_directory}
#         conditions << { "uploadId" => options[:upload_id] } if options[:upload_id]

#         conditions << { "partNumber" => options[:part_number] } if options[:part_number]
#         conditions << {"acl" => uploader.acl}

#         if uploader.use_action_status
#           conditions << {"success_action_status" => uploader.success_action_status}
#         else
#           conditions << {"success_action_redirect" => uploader.success_action_redirect}
#         end

#         conditions << ["content-length-range", options[:min_file_size], options[:max_file_size]]

#         yield conditions if block_given?

#         @policy = Base64.encode64(
#           {
#             'expiration' => (Time.now + options[:expiration]).utc.iso8601,
#             'conditions' => conditions,
#           }.to_json
#         ).gsub("\n","")
#       end

#     end
#   end
# end
