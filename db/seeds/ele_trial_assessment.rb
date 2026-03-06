# frozen_string_literal: true

# ELE Trial Assessment Seed
# Run with: rails db:seed:ele_trial_assessment

data = {
  'assessment_name' => 'ELE trial',
  'questions' => [
    {
      'name' => 'Builds People Capability - Q1',
      'text' => 'Tell me about a time when you played a key role in coaching or mentoring a team member to help them achieve their full potential.',
      'competencyName' => 'Builds People Capability'
    },
    {
      'name' => 'Displays Emotional Intelligence - Q1',
      'text' => "Can you share an example of how you've motivated or influenced your team during a critical or high-pressure situation?",
      'competencyName' => 'Displays Emotional Intelligence'
    },
    {
      'name' => 'Steers Change - Q1',
      'text' => 'Can you tell me about a time when you led a significant change or transformation, and how you managed the process from start to finish?',
      'competencyName' => 'Steers Change'
    },
    {
      'name' => 'Makes Decisions - Q1',
      'text' => 'Describe a time when you had to make a difficult decision with incomplete information. How did you approach it, and what was the outcome?',
      'competencyName' => 'Makes Decisions'
    },
    {
      'name' => 'Exemplifies Mental Toughness - Q1',
      'text' => 'Tell me about a time when you failed or made a mistake. How did you handle it, and what did you learn?',
      'competencyName' => 'Exemplifies Mental Toughness'
    }
  ],
  'competencies' => [
    {
      'name' => 'Builds People Capability',
      'definition' => 'Believes in the capability of individuals and teams, supporting, enabling and empowering them to realise their full potential. Actively invests in building the leadership pipeline for the organisation.',
      'what_to_look_for' => 'Believes in the capability of individuals and teams, supporting, enabling and empowering them to realise their full potential. Actively invests in building the leadership pipeline for the organisation.',
      'min_score' => 1,
      'max_score' => 5
    },
    {
      'name' => 'Displays Emotional Intelligence',
      'definition' => "Displays the ability to identify, recognise and manage own and others' emotions, strengths and personal motivations. Can adapt and regulate one's emotions towards others.",
      'what_to_look_for' => "Displays the ability to identify, recognise and manage own and others' emotions, strengths and personal motivations. Can adapt and regulate one's emotions towards others.",
      'min_score' => 1,
      'max_score' => 5
    },
    {
      'name' => 'Steers Change',
      'definition' => 'Embraces new and exciting challenges. Displays resilience and enables the implementation and acceptance of change within the workplace by ensuring all stakeholders are aligned and comfortable with the same.',
      'what_to_look_for' => 'Embraces new and exciting challenges. Displays resilience and enables the implementation and acceptance of change within the workplace by ensuring all stakeholders are aligned and comfortable with the same.',
      'min_score' => 1,
      'max_score' => 5
    },
    {
      'name' => 'Makes Decisions',
      'definition' => 'Identifies and analyses information provided to choose the best course of action. Takes a stand and makes decisions based on knowledge, information or background available.',
      'what_to_look_for' => 'Identifies and analyses information provided to choose the best course of action. Takes a stand and makes decisions based on knowledge, information or background available.',
      'min_score' => 1,
      'max_score' => 5
    },
    {
      'name' => 'Exemplifies Mental Toughness',
      'definition' => 'Demonstrates resilience, determination and a strong mindset in the face of challenges, adversity, and pressure. Maintains perseverance, optimism and has the necessary resources to cope during difficult situations.',
      'what_to_look_for' => 'Demonstrates resilience, determination and a strong mindset in the face of challenges, adversity, and pressure. Maintains perseverance, optimism and has the necessary resources to cope during difficult situations.',
      'min_score' => 1,
      'max_score' => 5
    }
  ],
  'indicators' => [
    {
      'competencyName' => 'Builds People Capability',
      'name' => 'Strengths & Development Focus',
      'definition' => "Understands one's own and the team's strengths and development needs while focusing on continuous development.",
      'what_to_look_for' => "Evidence of assessing team members' current skill levels and capabilities; Recognition of individual strengths and how they contribute to team success; Identification of specific development areas or skill gaps; Self-awareness of own strengths and areas for improvement",
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No mention of assessing or understanding team/individual strengths. No reference to development needs or skill gaps.',
      'score_level_2' => "Minimal/Vague Demonstration: Vague or generic references to 'knowing the team'. Superficial acknowledgment of strengths without specifics.",
      'score_level_3' => "Adequate Demonstration: Clear identification of at least one specific strength or development need. Shows basic understanding of team members' capabilities.",
      'score_level_4' => 'Strong Demonstration: Detailed assessment of multiple strengths and development areas. Clear connection between identified needs and actions taken.',
      'score_level_5' => "Exceptional Demonstration: Comprehensive, systematic approach to understanding capabilities. Rich detail about multiple team members' strengths and development needs."
    },
    {
      'competencyName' => 'Builds People Capability',
      'name' => 'Coaching & Mentoring',
      'definition' => 'Coaches and mentors key talent by providing constructive and timely feedback and guidance.',
      'what_to_look_for' => 'Evidence of regular one-on-one coaching conversations; Providing specific, actionable feedback (not just praise or criticism); Timely intervention when performance issues arise',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No mention of providing feedback or guidance. Response suggests directive management without developmental focus.',
      'score_level_2' => "Minimal/Vague Demonstration: Generic mention of 'giving feedback' without specifics. Feedback appears infrequent or reactive only.",
      'score_level_3' => 'Adequate Demonstration: Clear example of providing constructive feedback. Evidence of some structured coaching approach.',
      'score_level_4' => 'Strong Demonstration: Multiple examples of coaching interventions. Feedback is specific, timely, and constructive.',
      'score_level_5' => 'Exceptional Demonstration: Systematic, ongoing coaching relationship described. Rich examples of developmental conversations.'
    },
    {
      'competencyName' => 'Builds People Capability',
      'name' => 'Development Opportunities',
      'definition' => 'Builds individual capability by providing challenging and diverse development opportunities.',
      'what_to_look_for' => 'Assigning stretch assignments that push beyond comfort zone; Providing exposure to new areas, skills, or stakeholders; Delegating meaningful work',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No mention of providing growth opportunities. Work assignment appears purely task-based.',
      'score_level_2' => "Minimal/Vague Demonstration: Vague reference to 'giving opportunities' without specifics.",
      'score_level_3' => 'Adequate Demonstration: Clear example of providing a developmental opportunity.',
      'score_level_4' => 'Strong Demonstration: Multiple diverse opportunities provided.',
      'score_level_5' => 'Exceptional Demonstration: Comprehensive approach to development through experience.'
    },
    {
      'competencyName' => 'Builds People Capability',
      'name' => 'Career Development Pathways',
      'definition' => 'Identifies career development priorities and learning pathways for the team to meet future business demands.',
      'what_to_look_for' => 'Discussing career aspirations with team members; Creating individual development plans; Connecting development to future business needs',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No mention of career discussions or planning.',
      'score_level_2' => 'Minimal/Vague Demonstration: Brief or superficial mention of career development.',
      'score_level_3' => 'Adequate Demonstration: Evidence of career-focused discussions with team members.',
      'score_level_4' => 'Strong Demonstration: Clear development plans linked to career progression.',
      'score_level_5' => 'Exceptional Demonstration: Comprehensive career development framework.'
    },
    {
      'competencyName' => 'Displays Emotional Intelligence',
      'name' => 'Emotional Cue Recognition',
      'definition' => 'Recognises and interprets emotional cues from team members and stakeholders, fostering a heightened awareness of the emotional climate.',
      'what_to_look_for' => 'Noticing changes in team mood, energy, or engagement; Reading non-verbal cues (body language, tone, facial expressions); Identifying underlying emotions beneath surface behavior',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => "No Evidence: No mention of noticing or considering others' emotions. Response suggests task-focus without people awareness.",
      'score_level_2' => 'Minimal/Vague Demonstration: Generic acknowledgment of emotions. Limited specificity about emotional observations.',
      'score_level_3' => 'Adequate Demonstration: Clear recognition of specific emotional states. Evidence of noticing emotional cues in the situation.',
      'score_level_4' => "Strong Demonstration: Nuanced reading of multiple individuals' emotional states. Evidence of picking up subtle or non-verbal cues.",
      'score_level_5' => 'Exceptional Demonstration: Sophisticated emotional intelligence in reading situations. Picks up subtle, complex, or conflicting emotional cues.'
    },
    {
      'competencyName' => 'Displays Emotional Intelligence',
      'name' => 'Psychological Safety',
      'definition' => 'Encourages team members to express their emotions and concerns openly, creating a psychologically safe environment.',
      'what_to_look_for' => 'Creating space for people to voice concerns; Responding non-defensively to criticism or bad news; Encouraging questions and challenges to ideas',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of creating safe space for expression. Response suggests closed or top-down communication.',
      'score_level_2' => 'Minimal/Vague Demonstration: Generic mention of open door policy or similar. Limited evidence of actively creating safety.',
      'score_level_3' => 'Adequate Demonstration: Clear example of encouraging open expression. Evidence of listening to concerns raised.',
      'score_level_4' => 'Strong Demonstration: Active creation of psychologically safe environment. Multiple examples of encouraging and responding to input.',
      'score_level_5' => 'Exceptional Demonstration: Systematic approach to building psychological safety. Evidence of transforming team culture toward openness.'
    },
    {
      'competencyName' => 'Displays Emotional Intelligence',
      'name' => 'Emotional Responsiveness',
      'definition' => 'Responds effectively to the emotional needs of others, balancing support and direction as needed.',
      'what_to_look_for' => 'Providing appropriate support when others are struggling; Adjusting leadership style to emotional context; Balancing empathy with accountability',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => "No Evidence: No response to others' emotional needs. Focus purely on task without emotional consideration.",
      'score_level_2' => 'Minimal/Vague Demonstration: Acknowledgment of emotions without effective response. Response seems generic or formulaic.',
      'score_level_3' => 'Adequate Demonstration: Clear response to identified emotional needs. Evidence of both listening and taking action.',
      'score_level_4' => 'Strong Demonstration: Thoughtful, tailored response to emotional needs. Effective balance of empathy and accountability.',
      'score_level_5' => 'Exceptional Demonstration: Masterful balance of support and direction. Highly adaptive responses to complex emotional situations.'
    },
    {
      'competencyName' => 'Displays Emotional Intelligence',
      'name' => 'Professional Emotion Management',
      'definition' => 'Demonstrates the ability to manage personal emotions professionally, especially in high-pressure situations, setting a positive example for others.',
      'what_to_look_for' => 'Staying calm under pressure; Managing frustration, anxiety, or anger appropriately; Not allowing personal emotions to negatively impact team',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of managing own emotions. May indicate emotional reactivity or volatility.',
      'score_level_2' => 'Minimal/Vague Demonstration: Basic acknowledgment of own emotions without clear management. Some evidence of emotional impact on behavior.',
      'score_level_3' => 'Adequate Demonstration: Clear example of managing emotions in a difficult situation. Evidence of maintaining professionalism under pressure.',
      'score_level_4' => 'Strong Demonstration: Consistent emotional management across situations. Clear evidence of modeling regulation for others.',
      'score_level_5' => 'Exceptional Demonstration: Masterful self-regulation in extreme circumstances. Transforms own emotional experience into team inspiration.'
    },
    {
      'competencyName' => 'Steers Change',
      'name' => 'Change Role Model',
      'definition' => 'Acts as a role model for positive change, inspiring team members to embrace change by illustrating its potential positive impact.',
      'what_to_look_for' => 'Demonstrating personal enthusiasm for the change; Being first to adopt new behaviors or processes; Sharing vision of positive outcomes',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of modeling positive change behavior. May indicate resistance or reluctance toward change.',
      'score_level_2' => 'Minimal/Vague Demonstration: Generic acceptance of change without active modeling. Limited personal demonstration of change behaviors.',
      'score_level_3' => 'Adequate Demonstration: Clear example of personally demonstrating change. Some communication of positive vision.',
      'score_level_4' => 'Strong Demonstration: Active, visible modeling of change behaviors. Compelling communication of positive outcomes.',
      'score_level_5' => "Exceptional Demonstration: Inspiring role model who transforms others' attitudes. Powerful articulation of change vision and benefits."
    },
    {
      'competencyName' => 'Steers Change',
      'name' => 'Change Leadership',
      'definition' => 'Comfortably leads team during times of change by providing appropriate resources.',
      'what_to_look_for' => 'Providing training and skill-building for change; Securing necessary tools, time, or budget; Removing obstacles to change adoption',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of providing resources for change. Change appears mandated without support.',
      'score_level_2' => 'Minimal/Vague Demonstration: Generic mention of support without specifics. Limited evidence of actual resource provision.',
      'score_level_3' => 'Adequate Demonstration: Clear example of providing specific resources. Evidence of supporting team through transition.',
      'score_level_4' => 'Strong Demonstration: Comprehensive resource provision for change. Multiple types of support provided.',
      'score_level_5' => 'Exceptional Demonstration: Strategic, comprehensive resourcing of change. Anticipates resource needs before they arise.'
    },
    {
      'competencyName' => 'Steers Change',
      'name' => 'Change Translation',
      'definition' => 'Translates overall change journey into clearly defined actions, initiatives and priorities for team.',
      'what_to_look_for' => 'Breaking down large change into manageable steps; Creating clear action plans and milestones; Prioritizing change activities appropriately',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of translating change into actions. Change presented as abstract or overwhelming.',
      'score_level_2' => 'Minimal/Vague Demonstration: Generic or vague action description. Limited breakdown of change journey.',
      'score_level_3' => 'Adequate Demonstration: Clear translation into specific actions. Basic breakdown with identifiable steps.',
      'score_level_4' => 'Strong Demonstration: Comprehensive action plan with clear priorities. Effective breakdown making change manageable.',
      'score_level_5' => 'Exceptional Demonstration: Masterful translation of complex change. Creates clarity from ambiguity.'
    },
    {
      'competencyName' => 'Steers Change',
      'name' => 'Change Communication',
      'definition' => 'Understands the impact of change on team members and communicates in a manner that enables buy-in and support.',
      'what_to_look_for' => 'Explaining the why behind change; Acknowledging impact and concerns; Tailoring messages to different audiences',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of change communication effort. Change appears announced without explanation.',
      'score_level_2' => 'Minimal/Vague Demonstration: Basic communication without engagement. Limited explanation of rationale.',
      'score_level_3' => 'Adequate Demonstration: Clear communication of change rationale. Some acknowledgment of impact and concerns.',
      'score_level_4' => 'Strong Demonstration: Compelling communication of vision and rationale. Active acknowledgment and addressing of concerns.',
      'score_level_5' => 'Exceptional Demonstration: Inspirational communication that creates buy-in. Masterful handling of resistance and concerns.'
    },
    {
      'competencyName' => 'Makes Decisions',
      'name' => 'Information Seeking',
      'definition' => 'Seeks additional information or insights when faced with uncertainty, ensuring progress is not hindered by a lack of complete information.',
      'what_to_look_for' => 'Actively gathering data before deciding; Asking probing questions to understand situation; Consulting relevant sources and experts',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of seeking information. Decision appears made without investigation.',
      'score_level_2' => 'Minimal/Vague Demonstration: Limited or superficial information gathering. Relies on readily available information only.',
      'score_level_3' => 'Adequate Demonstration: Clear evidence of information seeking. Consults relevant sources before deciding.',
      'score_level_4' => 'Strong Demonstration: Systematic approach to information gathering. Multiple diverse sources consulted.',
      'score_level_5' => 'Exceptional Demonstration: Comprehensive, strategic information gathering. Identifies and pursues non-obvious information sources.'
    },
    {
      'competencyName' => 'Makes Decisions',
      'name' => 'Multiple Viewpoints',
      'definition' => 'Demonstrates the ability to incorporate multiple viewpoints and data sources to make well-rounded and informed decisions.',
      'what_to_look_for' => 'Seeking input from diverse stakeholders; Considering different perspectives on the issue; Weighing competing interests fairly',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of considering multiple perspectives. Decision appears unilateral or narrow.',
      'score_level_2' => 'Minimal/Vague Demonstration: Limited perspective-seeking. May consult similar others (not diverse).',
      'score_level_3' => 'Adequate Demonstration: Clear evidence of seeking multiple views. Consults stakeholders with different perspectives.',
      'score_level_4' => 'Strong Demonstration: Systematic inclusion of diverse perspectives. Actively seeks dissenting or challenging views.',
      'score_level_5' => 'Exceptional Demonstration: Masterful integration of diverse perspectives. Actively challenges own view with contrary input.'
    },
    {
      'competencyName' => 'Makes Decisions',
      'name' => 'Decision Confidence',
      'definition' => 'Inspires trust and conviction through consistent decision-making, fostering buy-in and alignment from team members and other relevant parties.',
      'what_to_look_for' => 'Making clear, definitive decisions; Communicating decisions with conviction; Standing behind decisions when challenged',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of confident decision-making. May indicate indecision or avoidance.',
      'score_level_2' => 'Minimal/Vague Demonstration: Decision made but without clear conviction. Limited communication of rationale.',
      'score_level_3' => 'Adequate Demonstration: Clear decision made and communicated. Basic rationale provided.',
      'score_level_4' => 'Strong Demonstration: Decisive action with clear conviction. Compelling communication of rationale.',
      'score_level_5' => 'Exceptional Demonstration: Inspires confidence through decisive leadership. Masterful communication creating strong buy-in.'
    },
    {
      'competencyName' => 'Makes Decisions',
      'name' => 'Decision Reflection',
      'definition' => 'Reflects on the results and consequences of decisions, identifying areas for improvement to enhance effectiveness over time.',
      'what_to_look_for' => "Reviewing outcomes of decisions made; Identifying what worked and what didn't; Extracting lessons for future decisions",
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of reflection on decisions. No mention of outcomes or lessons.',
      'score_level_2' => 'Minimal/Vague Demonstration: Brief or superficial reflection. Limited insight into what was learned.',
      'score_level_3' => 'Adequate Demonstration: Clear reflection on decision outcomes. Identification of lessons learned.',
      'score_level_4' => 'Strong Demonstration: Systematic reflection on decision effectiveness. Clear lessons extracted and applied.',
      'score_level_5' => 'Exceptional Demonstration: Comprehensive reflection practice. Profound insights that transform future approach.'
    },
    {
      'competencyName' => 'Exemplifies Mental Toughness',
      'name' => 'Recovery from Setbacks',
      'definition' => 'Demonstrates the ability to recover from disappointments or setbacks and refocus efforts on achieving success.',
      'what_to_look_for' => 'Bouncing back after failure or disappointment; Maintaining focus after setbacks; Processing disappointment constructively',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of recovery from setback. Setback may not be acknowledged.',
      'score_level_2' => 'Minimal/Vague Demonstration: Setback acknowledged but recovery unclear. Limited evidence of constructive response.',
      'score_level_3' => 'Adequate Demonstration: Clear example of recovering from setback. Evidence of refocusing on goals.',
      'score_level_4' => 'Strong Demonstration: Strong recovery from significant setback. Quick refocusing on constructive action.',
      'score_level_5' => 'Exceptional Demonstration: Remarkable resilience from major setback. Transforms failure into significant growth.'
    },
    {
      'competencyName' => 'Exemplifies Mental Toughness',
      'name' => 'Team Support',
      'definition' => 'Offers guidance, support, and resources to help team members navigate challenges and develop their skills.',
      'what_to_look_for' => 'Providing support during difficult times; Helping team members overcome obstacles; Offering guidance based on experience',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of supporting team through challenges. Focus entirely on personal experience.',
      'score_level_2' => 'Minimal/Vague Demonstration: Brief mention of team without specific support. Limited evidence of actual help provided.',
      'score_level_3' => 'Adequate Demonstration: Clear example of providing team support. Specific guidance or resources offered.',
      'score_level_4' => 'Strong Demonstration: Comprehensive support for team during adversity. Multiple forms of support provided.',
      'score_level_5' => 'Exceptional Demonstration: Exceptional team support during extreme challenge. Transforms team capability through adversity.'
    },
    {
      'competencyName' => 'Exemplifies Mental Toughness',
      'name' => 'Positive Outlook',
      'definition' => "Maintains a positive outlook and belief in one's and the team's ability to overcome challenges and persevere in the face of adversity.",
      'what_to_look_for' => 'Expressing optimism about outcomes; Maintaining belief in possibility of success; Seeing opportunities in challenges',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of positive outlook. Response may focus on difficulties without hope.',
      'score_level_2' => 'Minimal/Vague Demonstration: Generic positive statement without conviction. Limited evidence of genuine optimism.',
      'score_level_3' => 'Adequate Demonstration: Clear expression of positive outlook. Evidence of believing in successful outcome.',
      'score_level_4' => 'Strong Demonstration: Strong, genuine optimism communicated. Maintains positive outlook in significant adversity.',
      'score_level_5' => "Exceptional Demonstration: Inspiring, authentic positive outlook in extreme adversity. Transforms team's perspective through optimism."
    },
    {
      'competencyName' => 'Exemplifies Mental Toughness',
      'name' => 'Fostering Resilience',
      'definition' => 'Encourages optimism and positivity among team/colleagues, fostering a supportive and resilient team culture.',
      'what_to_look_for' => 'Building team resilience capabilities; Creating supportive team culture; Encouraging team members during difficulties',
      'min_score' => 1,
      'max_score' => 5,
      'score_level_1' => 'No Evidence: No evidence of building team resilience. Focus on individual without team culture.',
      'score_level_2' => 'Minimal/Vague Demonstration: Brief mention of team morale without specific action. Limited evidence of culture-building.',
      'score_level_3' => 'Adequate Demonstration: Clear examples of fostering team positivity. Evidence of encouraging team members.',
      'score_level_4' => 'Strong Demonstration: Systematic building of team resilience. Multiple approaches to fostering positivity.',
      'score_level_5' => 'Exceptional Demonstration: Transforms team culture toward lasting resilience. Creates self-sustaining supportive environment.'
    }
  ]
}

ActiveRecord::Base.transaction do
  # 1. Create/Find Dimension
  dimension = Dimension.find_or_create_by!(name: data['assessment_name']) do |d|
    d.dimension_type = :regular
    d.owner = nil
  end
  puts "Dimension: #{dimension.name} (ID: #{dimension.id})"

  # 2. Create/Find Assessment
  assessment = Assessment.find_or_create_by!(name: data['assessment_name']) do |a|
    a.dimension = dimension
    a.type = 'Assessments::Common'
    a.category = :psychometric
    a.owner = nil
  end
  puts "Assessment: #{assessment.name} (ID: #{assessment.id})"

  # 3. Create/Find Main Block
  block = assessment.blocks.find_or_create_by!(name: 'Main Block') do |b|
    b.position = 1
  end
  block.update!(
    props: {
      'randomization' => { 'type' => 'No' },
      'buttons' => { 'prev_button' => 'Previous', 'next_button' => 'Next' }
    }
  )
  puts 'Block created/updated.'

  # 4. Sync Factors (Competencies)
  comp_map = {}
  data['competencies'].each do |c|
    f = Factor.find_or_initialize_by(name: c['name'], dimension: dimension)

    # Build score definitions array from score_level_1 through score_level_5
    score_definitions = []
    if c['min_score'] && c['max_score']
      (c['min_score']..c['max_score']).each do |score|
        level_key = "score_level_#{score}"
        score_definitions << {
          'score' => score,
          'definition' => c[level_key] || ''
        }
      end
    end

    f.update!(
      description: c['definition'],
      what_to_look_for: c['what_to_look_for'],
      score_min: c['min_score'],
      score_max: c['max_score'],
      score_definitions: score_definitions.presence,
      scoring_strategy: :sub_factors_average,
      factor_type: :regular
    )
    comp_map[c['name']] = f
  end
  puts 'Competencies synced.'

  # 5. Sync Factors (Indicators) & link to parent Competencies
  data['indicators'].each do |ind|
    indicator = Factor.find_or_initialize_by(name: ind['name'], dimension: dimension)

    # Build score definitions array from score_level_1 through score_level_5
    score_definitions = []
    if ind['min_score'] && ind['max_score']
      (ind['min_score']..ind['max_score']).each do |score|
        level_key = "score_level_#{score}"
        score_definitions << {
          'score' => score,
          'definition' => ind[level_key] || ''
        }
      end
    end

    indicator.update!(
      description: ind['definition'],
      what_to_look_for: ind['what_to_look_for'],
      score_min: ind['min_score'],
      score_max: ind['max_score'],
      score_definitions: score_definitions.presence,
      scoring_strategy: :questions,
      factor_type: :indicator
    )
    parent = comp_map[ind['competencyName']]
    FactorsSubFactor.find_or_create_by!(factor: parent, sub_factor: indicator) if parent
  end
  puts 'Indicators and relationships synced.'

  # 6. Sync Questions & Scorings
  data['questions'].each_with_index do |q_item, idx|
    name = q_item['name']

    question = assessment.questions.find_or_initialize_by(name: name)
    question.update!(
      type: 'VideoResponse',
      block: block,
      position: idx + 1,
      props: {
        'questionText' => q_item['text'],
        'duration' => 120,
        'maxTakes' => 3,
        'scoreWithAIEnabled' => true,
        'enableTranscription' => true
      },
      validation: { 'type' => 'None', 'args' => {} },
      required_validation: { 'enabled' => true, 'type' => 'Force' }
    )

    # Link scoring (Question -> Indicator)
    indicators = data['indicators'].select { |i| i['competencyName'] == q_item['competencyName'] }
    indicators.each do |ind_data|
      factor = Factor.find_by(dimension: dimension, name: ind_data['name'], factor_type: :indicator)
      next unless factor

      # Build ai_scoring_config with what_to_look_for and score_definitions
      ai_scoring_config = {
        'what_to_look_for' => ind_data['what_to_look_for'] || ind_data['definition'],
        'score_definitions' => (ind_data['min_score']..ind_data['max_score']).map do |score|
          level_key = "score_level_#{score}"
          { 'score' => score.to_s, 'definition' => ind_data[level_key] || '' }
        end
      }

      fs = FactorsScoring.find_or_initialize_by(assessment: assessment, question: question, factor: factor)
      fs.update!(scoring_strategy: :answers_average, ai_scoring_config: ai_scoring_config)
    end
  end
  puts 'Questions and scorings synced.'
  puts "Successfully setup assessment '#{assessment.name}' with #{assessment.questions.count} questions."
end

Assessment.find_by(name: 'ELE trial')&.questions&.update_all(skip_logic: [])
