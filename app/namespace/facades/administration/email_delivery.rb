module Facades
  module Administration
    module EmailDelivery
      RULES = {
          invitation: {
              send_now: 1,
              on_specific_datetime: 2
          },
          reminder: {
              #examples
              assessment_not_completed: 1,
              assessment_not_started: 2,
              assessment_in_progress: 3
          }
      }
      # use this hash for dynamically update output of inputs
      SHOW_INPUTS_FOR_DATE_AND_TIME = {
          invitation: [2]
      }
    end
  end
end
