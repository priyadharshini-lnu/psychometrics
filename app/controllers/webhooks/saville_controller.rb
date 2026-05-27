# frozen_string_literal: true

module Webhooks
  class SavilleController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def results
      Saville::SaveResultsAndReportsJob.perform_later(request.raw_post.to_s)

      head :ok
    end
  end
end
