# frozen_string_literal: true

module Mhs
  module Exceptions
    class MhsError < StandardError; end
    class CreateSessionFailed < MhsError; end
    class CreateDataGathererFailed < MhsError; end
    class CreateEvaluatorFailed < MhsError; end
    class GetDataGatheringFailed < MhsError; end
    class CreateEnrichmentResultFailed < MhsError; end
    class GetEnrichmentResultFailed < MhsError; end
  end
end
