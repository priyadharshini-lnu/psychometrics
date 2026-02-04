# frozen_string_literal: true

# Monkey patch for OCI Ruby SDK to support language auto-detection
# This adds LANGUAGE_CODE_AUTO = "auto" similar to the Python SDK
# https://github.com/oracle/oci-python-sdk/blob/master/src/oci/ai_speech/models/transcription_model_details.py

module OCI
  module AiSpeech
    module Models
      class TranscriptionModelDetails
        LANGUAGE_CODE_AUTO = 'auto'

        # Store the original enum before modifying
        original_enum = const_get(:LANGUAGE_CODE_ENUM).dup
        remove_const(:LANGUAGE_CODE_ENUM)

        # Add LANGUAGE_CODE_AUTO to the existing enum
        LANGUAGE_CODE_ENUM = (original_enum + [LANGUAGE_CODE_AUTO]).freeze
      end
    end
  end
end
