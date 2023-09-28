class NormlizeCheckers < ActiveRecord::Migration[6.1]
  def change
    Assessment.find_each do |assessment|
      if assessment.enable_video_check.is_a?(String)
        assessment.enable_video_check = assessment.enable_video_check == '1'
      end
      if assessment.enable_audio_check.is_a?(String)
        assessment.enable_audio_check = assessment.enable_audio_check == '1'
      end
      if assessment.enable_network_check.is_a?(String)
        assessment.enable_network_check = assessment.enable_network_check == '1'
      end


      assessment.save(validate: false) unless assessment.extra.empty?
    end
  end
end
