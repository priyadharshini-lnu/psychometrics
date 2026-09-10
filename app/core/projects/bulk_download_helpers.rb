# frozen_string_literal: true

module Projects
  module BulkDownloadHelpers
    module_function

    def safe_folder_name(name)
      name.to_s.
        unicode_normalize(:nfkd).
        encode('ASCII', invalid: :replace, undef: :replace, replace: '').
        gsub(%r{[/\\:*?"<>|]}, '-').
        gsub(/\s+/, '_').
        gsub(/-{2,}/, '-').
        strip.
        presence || 'unknown'
    end
  end
end
