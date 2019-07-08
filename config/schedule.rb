every 5.minutes do
  rake 'communications:proccess'
  rake 'schedule_email:proccess'
end

every :day, at: '00:00 am' do
  rake 'license:check_expire'
end