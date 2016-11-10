every 5.minutes do
  runner 'Communications::OnSpecificDatetimeJob.perform_later'
  runner 'Communications::IfNotStartedJob.perform_later'
  runner 'Communications::IfNotFinishedJob.perform_later'
end
